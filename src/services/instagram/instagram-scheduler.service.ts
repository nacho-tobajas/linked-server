import { inject, injectable } from 'inversify';
import { InstagramRepository } from '../../repositories/instagram/instagram.dao.js';
import { InstagramService } from './instagram.service.js';

const IS_DEV = process.env.NODE_ENV !== 'production';

// Intervalo de ejecución: cada 2 horas por defecto
const SYNC_INTERVAL_MS = Number(process.env.INSTAGRAM_SYNC_INTERVAL_MINUTES ?? 120) * 60 * 1000;

// Producción: renovar si expira en menos de 30 días.
// Desarrollo: renovar si expira en menos de 59 días — el token se renueva en casi
// cada ejecución del scheduler, sobreviviendo reinicios frecuentes del servidor.
const REFRESH_THRESHOLD_MS = IS_DEV
  ? 59 * 24 * 60 * 60 * 1000
  : 30 * 24 * 60 * 60 * 1000;

@injectable()
export class InstagramSchedulerService {

  constructor(
    @inject(InstagramRepository) private instagramRepo: InstagramRepository,
    @inject(InstagramService) private instagramService: InstagramService
  ) {}

  start(): void {
    const thresholdDays = IS_DEV ? 59 : 30;
    console.log(`[InstagramScheduler] Iniciado — sync cada ${SYNC_INTERVAL_MS / 60000} min | umbral renovación: ${thresholdDays} días | modo: ${IS_DEV ? 'development' : 'production'}`);
    // Primera ejecución diferida 1 minuto tras el arranque
    setTimeout(() => {
      this.runSync();
      setInterval(() => this.runSync(), SYNC_INTERVAL_MS);
    }, 60_000);
  }

  private async runSync(): Promise<void> {
    console.log('[InstagramScheduler] Iniciando sync programado...');

    let tokens;
    try {
      tokens = await this.instagramRepo.findAllActive();
    } catch (err: any) {
      console.error('[InstagramScheduler] No se pudo obtener los tokens:', err?.message ?? err);
      return;
    }

    console.log(`[InstagramScheduler] ${tokens.length} cuentas registradas para procesar`);

    for (const token of tokens) {
      const tatuadorId = token.tatuador?.id;
      if (!tatuadorId || !token.access_token) continue;

      const now = Date.now();
      const expiresAt = token.token_expires_at?.getTime() ?? 0;

      // Token ya expirado
      if (expiresAt > 0 && expiresAt <= now) {
        if (IS_DEV) {
          // En desarrollo no se desvincula automáticamente: el servidor no corre
          // de forma continua y el token puede haber expirado entre reinicios.
          console.warn(`[InstagramScheduler][DEV] Token expirado para tatuadorId ${tatuadorId} — omitido (re-vinculá manualmente si es necesario)`);
        } else {
          try {
            await this.instagramService.disconnectInstagram(tatuadorId);
            console.warn(`[InstagramScheduler] Token expirado para tatuadorId ${tatuadorId} — cuenta desvinculada`);
          } catch (err: any) {
            console.error(`[InstagramScheduler] Error al desvincular tatuadorId ${tatuadorId}:`, err?.message ?? err);
          }
        }
        continue;
      }

      try {
        // Renovar si le quedan menos de 30 días — mantiene el token indefinidamente
        if (expiresAt > 0 && expiresAt - now < REFRESH_THRESHOLD_MS) {
          const daysLeft = Math.round((expiresAt - now) / 86_400_000);
          console.log(`[InstagramScheduler] Renovando token para tatuadorId ${tatuadorId} (${daysLeft} días restantes)`);
          await this.instagramService.refreshToken(tatuadorId, token.access_token);
          // Usar el token actualizado para el sync
          const updated = await this.instagramRepo.findByTatuadorId(tatuadorId);
          if (updated?.access_token) token.access_token = updated.access_token;
        }

        const result = await this.instagramService.syncInstagramPosts(tatuadorId);
        if (result.synced > 0 || result.deleted > 0) {
          console.log(`[InstagramScheduler] Tatuador ${tatuadorId}: +${result.synced} nuevos, -${result.deleted} eliminados, ${result.skipped} omitidos`);
        }
      } catch (err: any) {
        console.error(`[InstagramScheduler] Error sincronizando tatuadorId ${tatuadorId}:`, err?.message ?? err);
      }
    }

    console.log('[InstagramScheduler] Sync programado finalizado');
  }
}
