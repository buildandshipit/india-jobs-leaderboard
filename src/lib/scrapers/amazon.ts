import { BaseScraper } from './base';
import { ScrapedJob, ScraperResult } from '@/types';

interface AmazonJob {
  id_icims: string;
  title: string;
  city: string;
  state: string;
  country_code: string;
  job_category?: string;
  basic_qualifications?: string;
}

interface AmazonResponse {
  jobs: AmazonJob[];
  hits: number;
}

export class AmazonScraper extends BaseScraper {
  companyName = 'Amazon';
  companySlug = 'amazon';
  companyWebsite = 'https://amazon.jobs';
  companyLogo = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';

  async scrape(): Promise<ScraperResult> {
    const jobs: ScrapedJob[] = [];
    let offset = 0;
    const limit = 100;

    try {
      while (true) {
        // Amazon Jobs Search API
        const url = 'https://www.amazon.jobs/en/search';
        const params = new URLSearchParams({
          offset: offset.toString(),
          result_limit: limit.toString(),
          sort: 'relevant',
          country: 'IND',
          distanceType: 'Mi',
          radius: '24km',
          latitude: '',
          longitude: '',
          loc_group_id: '',
          loc_query: 'India',
          base_query: '',
          city: '',
          region: '',
          county: '',
          query_options: '',
          category: '',
          job_function_id: '',
          schedule_type_id: '',
          normalized_location: '',
          business_category: '',
        });

        const response = await this.fetchWithRetry(async () => {
          const res = await fetch(`${url}?${params}`, {
            headers: {
              'User-Agent': this.userAgent,
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          return res.json() as Promise<AmazonResponse>;
        });

        if (!response.jobs || response.jobs.length === 0) {
          break;
        }

        for (const job of response.jobs) {
          const location = [job.city, job.state].filter(Boolean).join(', ');

          jobs.push({
            externalId: job.id_icims,
            title: job.title,
            location: this.normalizeLocation(location),
            department: job.job_category,
            url: `https://www.amazon.jobs/en/jobs/${job.id_icims}`,
          });
        }

        if (jobs.length >= response.hits || response.jobs.length < limit) {
          break;
        }

        offset += limit;
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
