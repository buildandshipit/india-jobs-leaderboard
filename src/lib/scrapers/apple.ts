import { BaseScraper } from './base';
import { ScrapedJob, ScraperResult } from '@/types';

interface AppleJob {
  positionId: string;
  postingTitle: string;
  locations: Array<{ name: string }>;
  team?: { teamName: string };
}

interface AppleResponse {
  searchResults: AppleJob[];
  totalRecords: number;
}

export class AppleScraper extends BaseScraper {
  companyName = 'Apple';
  companySlug = 'apple';
  companyWebsite = 'https://jobs.apple.com';
  companyLogo = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';

  async scrape(): Promise<ScraperResult> {
    const jobs: ScrapedJob[] = [];
    let page = 0;
    const pageSize = 100;

    try {
      while (true) {
        const url = 'https://jobs.apple.com/api/role/search';
        const body = {
          query: '',
          filters: {
            range: {
              standardWeeklyHours: { start: null, end: null },
            },
            locations: [
              { countryID: 'IND' },
            ],
          },
          page: page,
          locale: 'en-us',
          sort: 'relevance',
        };

        const response = await this.fetchWithRetry(() =>
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': this.userAgent,
              Accept: 'application/json',
              'Accept-Language': 'en-US,en;q=0.9',
              'Origin': 'https://jobs.apple.com',
              'Referer': 'https://jobs.apple.com/en-us/search?location=india-IND',
            },
            body: JSON.stringify(body),
          }).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<AppleResponse>;
          })
        );

        if (!response.searchResults || response.searchResults.length === 0) {
          break;
        }

        for (const job of response.searchResults) {
          const location = job.locations?.map((l) => l.name).join(', ') || 'India';

          jobs.push({
            externalId: job.positionId,
            title: job.postingTitle,
            location: this.normalizeLocation(location),
            department: job.team?.teamName,
            url: `https://jobs.apple.com/en-us/details/${job.positionId}`,
          });
        }

        if (jobs.length >= response.totalRecords || response.searchResults.length < pageSize) {
          break;
        }

        page++;
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return { success: true, jobs };
    } catch (error) {
      return {
        success: false,
        jobs: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
