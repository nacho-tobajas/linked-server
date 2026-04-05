import { inject, injectable } from 'inversify';
import axios from 'axios';
import { InstagramRepository } from '../../repositories/instagram/instagram.dao.js';
import { TrabajosRepository } from '../../repositories/trabajos/trabajos.dao.js';
import { UserRepository } from '../../repositories/usuarios/user.dao.js';
import { Trabajo } from '../../models/trabajos/trabajo.entity.js';
import { TrabajoFoto } from '../../models/trabajos/trabajo-foto.entity.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';

const GRAPH_API_VERSION = 'v21.0';
const INSTAGRAM_OAUTH_BASE = 'https://api.instagram.com';

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  children?: { data: { id: string; media_url: string; media_type: string }[] };
}

export interface SyncResult {
  synced: number;
  skipped: number;
  deleted: number;
}

@injectable()
export class InstagramService {

  constructor(
    @inject(InstagramRepository) private instagramRepo: InstagramRepository,
    @inject(TrabajosRepository) private trabajosRepo: TrabajosRepository,
    @inject(UserRepository) private userRepo: UserRepository
  ) { }

  /**
   * Procesa el callback de OAuth de Meta:
   * 1. Intercambia el code por un token de corta duración
   * 2. Lo intercambia por un token de larga duración (60 días)
   * 3. Obtiene el Instagram Business Account ID del tatuador
   * 4. Guarda el token en la base de datos
   */
  async processOAuthCallback(code: string, tatuadorId: number): Promise<boolean> {
    const appId = process.env.META_APP_ID!;
    const appSecret = process.env.META_APP_SECRET!;
    const redirectUri = process.env.META_REDIRECT_URI!;

    // 1. Intercambiar code por token (POST form-encoded)
    console.log('[Instagram] Paso 1: intercambiando code por token...');
    const shortTokenResponse = await axios.post(
      `${INSTAGRAM_OAUTH_BASE}/oauth/access_token`,
      new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('[Instagram] Paso 1 OK - respuesta:', JSON.stringify(shortTokenResponse.data));

    const tokenFromStep1: string = shortTokenResponse.data.access_token;
    const expiresInFromStep1: number = shortTokenResponse.data.expires_in ?? 3600;
    const instagramUserId: string = String(shortTokenResponse.data.user_id);

    if (!tokenFromStep1) {
      throw new ValidationError('No se recibió access_token en el paso 1.', 422);
    }

    // 2. Intercambiar por token de larga duración (~60 días) via POST
    let finalToken = tokenFromStep1;
    let finalExpiresIn = expiresInFromStep1;
    let isLongLived = false;

    try {
      console.log('[Instagram] Paso 2: intentando obtener token de larga duración...');
      const longTokenResponse = await axios.post(
        `https://graph.instagram.com/access_token`,
        new URLSearchParams({
          grant_type: 'ig_exchange_token',
          client_secret: appSecret,
          access_token: tokenFromStep1
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      finalToken = longTokenResponse.data.access_token;
      finalExpiresIn = longTokenResponse.data.expires_in ?? 5183944;
      isLongLived = true;
      console.log('[Instagram] Paso 2 OK - token de larga duración obtenido, expira en:', finalExpiresIn, 's');
    } catch (err: any) {
      console.warn('[Instagram] Paso 2 falló - status:', err?.response?.status, '| body:', JSON.stringify(err?.response?.data ?? err.message));
    }

    const expiresAt = new Date(Date.now() + finalExpiresIn * 1000);

    // 3. Guardar en la base de datos
    await this.instagramRepo.saveOrUpdate(tatuadorId, finalToken, instagramUserId, expiresAt);
    console.log('[Instagram] Paso 3 OK - vinculación guardada para tatuadorId:', tatuadorId, '| token de larga duración:', isLongLived);

    // 4. Actualizar foto de perfil (solo si tenemos token funcional)
    if (isLongLived) {
      await this.syncProfilePhoto(tatuadorId, finalToken);
    }

    return isLongLived;
  }

  /**
   * Renueva el token de larga duración antes de que expire.
   * Instagram permite renovarlo si aún es válido.
   */
  async refreshToken(tatuadorId: number, accessToken: string): Promise<void> {
    try {
      const cleanToken = accessToken.replace(/\s/g, '');
      const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: { grant_type: 'ig_refresh_token', access_token: cleanToken }
      });
      const newToken: string = response.data.access_token;
      const expiresIn: number = response.data.expires_in ?? 5183944;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      await this.instagramRepo.updateToken(tatuadorId, newToken, expiresAt);
      console.log('[Instagram] Token renovado para tatuadorId:', tatuadorId, '| expira:', expiresAt.toISOString());
    } catch (err: any) {
      if (this.isOAuthExpiredError(err)) {
        await this.disconnectInstagram(tatuadorId);
        console.warn(`[Instagram] Token inválido para tatuadorId ${tatuadorId} — cuenta desvinculada automáticamente`);
      } else {
        console.warn('[Instagram] No se pudo renovar el token para tatuadorId:', tatuadorId, '|', err?.response?.data ?? err?.message);
      }
    }
  }

  /**
   * Sincroniza los posts de Instagram del tatuador como Trabajos en la base de datos.
   * - Importa nuevos posts de tipo IMAGE o CAROUSEL_ALBUM
   * - Elimina de la BD los trabajos cuyo post fue borrado en Instagram
   * Retorna la cantidad de posts nuevos, eliminados y omitidos.
   */
  async syncInstagramPosts(tatuadorId: number): Promise<SyncResult> {
    const tokenRecord = await this.instagramRepo.findByTatuadorId(tatuadorId);
    if (!tokenRecord || !tokenRecord.access_token || !tokenRecord.instagram_user_id) {
      throw new ValidationError('El tatuador no tiene una cuenta de Instagram vinculada.', 404);
    }

    const tatuador = await this.userRepo.findOne(tatuadorId);
    if (!tatuador) {
      throw new ValidationError('Tatuador no encontrado.', 404);
    }

    // Actualizar foto de perfil antes de continuar para que el cliente la vea actualizada
    await this.syncProfilePhoto(tatuadorId, tokenRecord.access_token);

    let mediaList: InstagramMedia[];
    try {
      mediaList = await this.fetchAllInstagramMedia(tokenRecord.instagram_user_id, tokenRecord.access_token);
    } catch (err: any) {
      if (this.isOAuthExpiredError(err)) {
        await this.disconnectInstagram(tatuadorId);
        console.warn(`[Instagram] Token expirado para tatuadorId ${tatuadorId} — cuenta desvinculada automáticamente`);
        throw new ValidationError('El token de Instagram expiró. Vinculá tu cuenta nuevamente desde Mi Perfil.', 401);
      }
      console.error('[Instagram] fetchMedia falló - status:', err?.response?.status);
      console.error('[Instagram] fetchMedia falló - body:', JSON.stringify(err?.response?.data));
      throw err;
    }

    // --- Eliminar posts que ya no existen en Instagram ---
    const instagramMediaIds = new Set(mediaList.map(m => m.id));
    const existingMediaIds = await this.trabajosRepo.findInstagramMediaIdsByTatuador(tatuadorId);

    let deleted = 0;
    for (const existingId of existingMediaIds) {
      if (!instagramMediaIds.has(existingId)) {
        await this.trabajosRepo.deleteByInstagramMediaId(existingId);
        deleted++;
      }
    }
    if (deleted > 0) {
      console.log(`[Instagram] Eliminados ${deleted} trabajos removidos de Instagram para tatuadorId: ${tatuadorId}`);
    }

    // --- Importar posts nuevos ---
    let synced = 0;
    let skipped = 0;

    for (const media of mediaList) {
      if (media.media_type === 'VIDEO') {
        skipped++;
        continue;
      }

      const existing = await this.trabajosRepo.findByInstagramMediaId(media.id);
      if (existing) {
        skipped++;
        continue;
      }

      const fotos = await this.extractPhotosFromMedia(media, tokenRecord.access_token);
      if (fotos.length === 0) {
        skipped++;
        continue;
      }

      const nuevoTrabajo = new Trabajo();
      nuevoTrabajo.tatuador = tatuador;
      nuevoTrabajo.descripcion = media.caption ?? '';
      nuevoTrabajo.creationuser = 'instagram_sync';
      nuevoTrabajo.creationtimestamp = new Date(media.timestamp);
      nuevoTrabajo.instagram_media_id = media.id;
      nuevoTrabajo.fotos = fotos;

      await this.trabajosRepo.create(nuevoTrabajo);
      synced++;
    }

    return { synced, skipped, deleted };
  }

  /**
   * Verifica si el tatuador tiene Instagram vinculado.
   */
  async getInstagramStatus(tatuadorId: number): Promise<{ connected: boolean; instagram_user_id?: string; expires_at?: Date }> {
    const record = await this.instagramRepo.findByTatuadorId(tatuadorId);
    if (!record) {
      return { connected: false };
    }
    return {
      connected: true,
      instagram_user_id: record.instagram_user_id,
      expires_at: record.token_expires_at
    };
  }

  /**
   * Desvincula la cuenta de Instagram del tatuador y limpia su foto de perfil.
   */
  async disconnectInstagram(tatuadorId: number): Promise<void> {
    await this.instagramRepo.deleteByTatuadorId(tatuadorId);
    try {
      await this.userRepo.update(tatuadorId, { profile_photo: null });
      console.log('[Instagram] Foto de perfil limpiada para tatuadorId:', tatuadorId);
    } catch (err: any) {
      console.warn('[Instagram] No se pudo limpiar foto de perfil al desvincular:', err?.message);
    }
  }

  // ─── Métodos privados ──────────────────────────────────────────────────────

  /**
   * Detecta errores OAuthException de token expirado/inválido (código 190).
   */
  private isOAuthExpiredError(err: any): boolean {
    return (
      err?.response?.status === 401 &&
      err?.response?.data?.error?.type === 'OAuthException' &&
      err?.response?.data?.error?.code === 190
    );
  }

  /**
   * Obtiene la foto de perfil de Instagram y la guarda en el perfil del tatuador.
   */
  private async syncProfilePhoto(tatuadorId: number, accessToken: string): Promise<void> {
    try {
      const cleanToken = accessToken.replace(/\s/g, '');
      const response = await axios.get(`https://graph.instagram.com/${GRAPH_API_VERSION}/me`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
        params: { fields: 'profile_picture_url' }
      });
      const profilePictureUrl: string | null = response.data?.profile_picture_url ?? null;
      await this.userRepo.update(tatuadorId, { profile_photo: profilePictureUrl });
      console.log(`[Instagram] Foto de perfil ${profilePictureUrl ? 'actualizada' : 'eliminada'} para tatuadorId:`, tatuadorId);
    } catch (err: any) {
      console.warn('[Instagram] No se pudo obtener foto de perfil:', err?.response?.data ?? err?.message);
    }
  }

  /**
   * Obtiene todos los posts de la cuenta de Instagram con paginación completa.
   */
  private async fetchAllInstagramMedia(instagramUserId: string, accessToken: string): Promise<InstagramMedia[]> {
    const cleanToken = accessToken.replace(/\s/g, '');
    const allMedia: InstagramMedia[] = [];

    const firstResponse = await axios.get(`https://graph.instagram.com/${GRAPH_API_VERSION}/me/media`, {
      headers: { Authorization: `Bearer ${cleanToken}` },
      params: { fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp', limit: 100 }
    });

    allMedia.push(...(firstResponse.data.data ?? []));
    let nextUrl: string | null = firstResponse.data.paging?.next ?? null;

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      allMedia.push(...(response.data.data ?? []));
      nextUrl = response.data.paging?.next ?? null;
    }

    console.log(`[Instagram] fetchMedia → total posts: ${allMedia.length} (userId=${instagramUserId})`);
    return allMedia;
  }

  /**
   * Extrae las URLs de imágenes de un post de Instagram.
   * Para CAROUSEL_ALBUM, obtiene las fotos hijas.
   */
  private async extractPhotosFromMedia(media: InstagramMedia, accessToken: string): Promise<TrabajoFoto[]> {
    const fotos: TrabajoFoto[] = [];

    if (media.media_type === 'IMAGE' && media.media_url) {
      const foto = new TrabajoFoto();
      foto.image_path = media.media_url;
      fotos.push(foto);

    } else if (media.media_type === 'CAROUSEL_ALBUM') {
      const cleanChildToken = accessToken.replace(/\s/g, '');
      const childrenResponse = await axios.get(`https://graph.instagram.com/${GRAPH_API_VERSION}/${media.id}/children`, {
        headers: { Authorization: `Bearer ${cleanChildToken}` },
        params: { fields: 'id,media_type,media_url' }
      });

      const children: { id: string; media_type: string; media_url?: string }[] = childrenResponse.data.data ?? [];

      for (const child of children) {
        if (child.media_type === 'IMAGE' && child.media_url) {
          const foto = new TrabajoFoto();
          foto.image_path = child.media_url;
          fotos.push(foto);
        }
      }
    }

    return fotos;
  }
}
