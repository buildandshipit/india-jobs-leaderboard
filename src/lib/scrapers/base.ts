import { ScrapedJob, ScraperResult } from '@/types';

export abstract class BaseScraper {
  abstract companyName: string;
  abstract companySlug: string;
  abstract companyWebsite: string;
  abstract companyLogo: string | null;

  protected userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  abstract scrape(): Promise<ScraperResult>;

  protected async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  protected async fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetcher();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error('Max retries reached');
  }

  protected normalizeLocation(location: string): string {
    return location
      .replace(/,?\s*India$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  protected isIndiaLocation(location: string): boolean {
    const indiaKeywords = [
      'india',
      'bangalore',
      'bengaluru',
      'hyderabad',
      'mumbai',
      'pune',
      'delhi',
      'gurgaon',
      'gurugram',
      'noida',
      'chennai',
      'kolkata',
      'ahmedabad',
      'jaipur',
    ];

    const locationLower = location.toLowerCase();
    return indiaKeywords.some((keyword) => locationLower.includes(keyword));
  }
}
