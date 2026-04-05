import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';
import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
}

@controller('/api/news')
export class NewsController {

  /**
   * GET /api/news
   * Retorna artículos recientes sobre el mundo del tatuaje.
   * Requiere NEWS_API_KEY en el .env (clave gratuita en newsapi.org).
   */
  @httpGet('/')
  public async getTattooNews(_req: Request, res: Response) {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.json({ articles: [] });
    }

    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'tattoo art OR tattoo culture OR tattooing',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 6,
          apiKey
        },
        timeout: 8000
      });

      const articles: NewsArticle[] = (response.data.articles ?? [])
        .filter((a: any) => a.title && a.title !== '[Removed]')
        .map((a: any) => ({
          title: a.title,
          description: a.description ?? null,
          url: a.url,
          urlToImage: a.urlToImage ?? null,
          publishedAt: a.publishedAt,
          source: a.source?.name ?? ''
        }));

      return res.json({ articles });
    } catch {
      // Si la API falla, retornar vacío para no romper la home
      return res.json({ articles: [] });
    }
  }
}
