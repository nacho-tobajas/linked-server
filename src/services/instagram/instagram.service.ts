import { inject, injectable } from 'inversify';
import axios from 'axios';
import { InstagramRepository } from '../../repositories/instagram/instagram.dao.js';
import { TrabajosRepository } from '../../repositories/trabajos/trabajos.dao.js';
import { UserRepository } from '../../repositories/usuarios/user.dao.js';
import { Trabajo } from '../../models/trabajos/trabajo.entity.js';
import { TrabajoFoto } from '../../models/trabajos/trabajo-foto.entity.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';

const GRAPH_API_VERSION = 'v19.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

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

    // 1. Intercambiar code por token de corta duración
    const shortTokenResponse = await axios.get(`${GRAPH_BASE_URL}/oauth/access_token`, {
      params: {
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code
      }
    });
    const shortLivedToken: string = shortTokenResponse.data.access_token;

    // 2. Intercambiar por token de larga duración (dura ~60 días)
    const longTokenResponse = await axios.get(`${GRAPH_BASE_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }
    });
    const longLivedToken: string = longTokenResponse.data.access_token;
    const expiresInSeconds: number = longTokenResponse.data.expires_in ?? 5183944; // ~60 días

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // 3. Obtener el Instagram Business Account ID del tatuador
    const instagramUserId = await this.getInstagramBusinessAccountId(longLivedToken);
    if (!instagramUserId) {
      throw new ValidationError(
        'No se encontró una cuenta de Instagram Business asociada a las páginas de Facebook del usuario. ' +
        'Asegurate de que tu cuenta de Instagram esté conectada a una Página de Facebook.',
        422
      );
    }

    // 4. Guardar en la base de datos
    await this.instagramRepo.saveOrUpdate(tatuadorId, longLivedToken, instagramUserId, expiresAt);
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

    const mediaList = await this.fetchInstagramMedia(tokenRecord.instagram_user_id, tokenRecord.access_token);

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
   * Obtiene el IG Business Account ID a través de las Páginas de Facebook del usuario.
   */
  private async getInstagramBusinessAccountId(accessToken: string): Promise<string | null> {
    const pagesResponse = await axios.get(`${GRAPH_BASE_URL}/me/accounts`, {
      params: { access_token: accessToken }
    });

    const pages: { id: string; access_token: string }[] = pagesResponse.data.data ?? [];

    for (const page of pages) {
      const pageResponse = await axios.get(`${GRAPH_BASE_URL}/${page.id}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: page.access_token
        }
      });

      const igAccount = pageResponse.data.instagram_business_account;
      if (igAccount?.id) {
        return igAccount.id as string;
      }
    }

    return null;
  }

  /**
   * Obtiene la lista de medios del IG Business Account.
   */
  private async fetchInstagramMedia(instagramUserId: string, accessToken: string): Promise<InstagramMedia[]> {
    const response = await axios.get(`${GRAPH_BASE_URL}/${instagramUserId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp',
        access_token: accessToken,
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
      const childrenResponse = await axios.get(`${GRAPH_BASE_URL}/${media.id}/children`, {
        params: {
          fields: 'id,media_type,media_url',
          access_token: accessToken
        }
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
