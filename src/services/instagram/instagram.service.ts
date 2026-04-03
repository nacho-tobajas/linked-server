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
const INSTAGRAM_GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  children?: { data: { id: string; media_url: string; media_type: string }[] };
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
  async processOAuthCallback(code: string, tatuadorId: number): Promise<void> {
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

    // 2. Intentar intercambiar por token de larga duración (~60 días)
    // Con instagram_business_basic el paso 1 puede devolver ya un token de larga duración,
    // en cuyo caso este paso falla y usamos directamente el token del paso 1.
    let finalToken = tokenFromStep1;
    let finalExpiresIn = expiresInFromStep1;

    try {
      console.log('[Instagram] Paso 2: intentando obtener token de larga duración...');
      const longTokenResponse = await axios.get(`https://graph.instagram.com/access_token`, {
        params: {
          grant_type: 'ig_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          access_token: tokenFromStep1
        }
      });
      finalToken = longTokenResponse.data.access_token;
      finalExpiresIn = longTokenResponse.data.expires_in ?? 5183944;
      console.log('[Instagram] Paso 2 OK - token de larga duración obtenido, expira en:', finalExpiresIn, 's');
    } catch (err: any) {
      console.warn('[Instagram] Paso 2 omitido (usando token del paso 1):', err?.response?.data ?? err.message);
    }

    const expiresAt = new Date(Date.now() + finalExpiresIn * 1000);

    // 3. Guardar en la base de datos
    await this.instagramRepo.saveOrUpdate(tatuadorId, finalToken, instagramUserId, expiresAt);
    console.log('[Instagram] Paso 3 OK - vinculación guardada para tatuadorId:', tatuadorId);
  }

  /**
   * Sincroniza los posts de Instagram del tatuador como Trabajos en la base de datos.
   * Solo importa posts de tipo IMAGE o CAROUSEL_ALBUM que no hayan sido importados antes.
   * Retorna la cantidad de nuevos posts importados.
   */
  async syncInstagramPosts(tatuadorId: number): Promise<{ synced: number; skipped: number }> {
    const tokenRecord = await this.instagramRepo.findByTatuadorId(tatuadorId);
    if (!tokenRecord || !tokenRecord.access_token || !tokenRecord.instagram_user_id) {
      throw new ValidationError('El tatuador no tiene una cuenta de Instagram vinculada.', 404);
    }

    const tatuador = await this.userRepo.findOne(tatuadorId);
    if (!tatuador) {
      throw new ValidationError('Tatuador no encontrado.', 404);
    }

    let mediaList: InstagramMedia[];
    try {
      mediaList = await this.fetchInstagramMedia(tokenRecord.instagram_user_id, tokenRecord.access_token);
    } catch (err: any) {
      console.error('[Instagram] fetchMedia falló - status:', err?.response?.status);
      console.error('[Instagram] fetchMedia falló - body:', JSON.stringify(err?.response?.data));
      throw err;
    }

    let synced = 0;
    let skipped = 0;

    for (const media of mediaList) {
      // Solo importar imágenes y carruseles (no videos)
      if (media.media_type === 'VIDEO') {
        skipped++;
        continue;
      }

      // Verificar si ya fue importado (por instagram_media_id único)
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

    return { synced, skipped };
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
   * Desvincula la cuenta de Instagram del tatuador.
   */
  async disconnectInstagram(tatuadorId: number): Promise<void> {
    await this.instagramRepo.deleteByTatuadorId(tatuadorId);
  }

  // ─── Métodos privados ──────────────────────────────────────────────────────

  /**
   * Obtiene la lista de medios de la cuenta de Instagram.
   */
  private async fetchInstagramMedia(_instagramUserId: string, accessToken: string): Promise<InstagramMedia[]> {
    console.log(`[Instagram] fetchMedia → URL: ${INSTAGRAM_GRAPH_BASE}/me/media`);
    const response = await axios.get(`${INSTAGRAM_GRAPH_BASE}/me/media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp',
        limit: 50
      }
    });
    return response.data.data ?? [];
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
      // Obtener las imágenes hijas del carrusel
      const childrenResponse = await axios.get(`${INSTAGRAM_GRAPH_BASE}/${media.id}/children`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
