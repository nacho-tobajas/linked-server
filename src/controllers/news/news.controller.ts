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

  @httpGet('/')
  public async getTattooNews(_req: Request, res: Response) {

    // Intento 1: NewsAPI (requiere NEWS_API_KEY en .env)
    const apiKey = process.env.NEWS_API_KEY;
    if (apiKey) {
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

        if (articles.length > 0) return res.json({ articles });
      } catch { /* caer al siguiente intento */ }
    }

    // Intento 2: Reddit r/tattoos — sin API key, siempre disponible
    try {
      const response = await axios.get(
        'https://www.reddit.com/r/tattoos/top.json',
        {
          params: { limit: 9, t: 'week' },
          headers: { 'User-Agent': 'LinkedApp/1.0 (tattoo community)' },
          timeout: 8000
        }
      );

      const posts: any[] = response.data?.data?.children ?? [];

      const articles: NewsArticle[] = posts
        .filter((p: any) => !p.data.over_18 && p.data.title)
        .slice(0, 6)
        .map((p: any) => {
          const preview =
            p.data.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') ?? null;
          const thumb =
            p.data.thumbnail?.startsWith('http') ? p.data.thumbnail : null;

          return {
            title: p.data.title,
            description: p.data.selftext?.trim() ? p.data.selftext.slice(0, 180) : null,
            url: `https://www.reddit.com${p.data.permalink}`,
            urlToImage: preview ?? thumb,
            publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
            source: 'r/tattoos'
          };
        });

      return res.json({ articles });
    } catch {
      return res.json({ articles: [] });
    }
  }
}
