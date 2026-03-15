import { BaseScraper } from './base';
import { ScrapedJob, ScraperResult } from '@/types';

interface MicrosoftJob {
  jobId: string;
  title: string;
  primaryLocation: string;
  jobType?: string;
  category?: string;
  jobSeekerJobDetailLink: string;
}

interface MicrosoftResponse {
  operationResult: {
    result: {
      jobs: MicrosoftJob[];
      totalJobs: number;
    };
  };
}

export class MicrosoftScraper extends BaseScraper {
  companyName = 'Microsoft';
  companySlug = 'microsoft';
  companyWebsite = 'https://careers.microsoft.com';
  companyLogo = 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31';

  async scrape(): Promise<ScraperResult> {
    const jobs: ScrapedJob[] = [];
    let page = 1;
    const pageSize = 100;

    try {
      while (true) {
        // Microsoft Careers API (POST request)
        const url = 'https://jobs.careers.microsoft.com/api/v1/search';
        const body = {
          filters: {
            country: ['India'],
          },
          page: page,
          pageSize: pageSize,
          searchText: '',
          orderBy: 'relevance',
        };

        const response = await this.fetchWithRetry(async () => {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': this.userAgent,
              Accept: 'application/json',
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          return res.json() as Promise<MicrosoftResponse>;
        });

        const result = response.operationResult?.result;
        if (!result || !result.jobs || result.jobs.length === 0) {
          break;
        }

        for (const job of result.jobs) {
          jobs.push({
            externalId: job.jobId,
            title: job.title,
            location: this.normalizeLocation(job.primaryLocation),
            department: job.category,
            url: `https://jobs.careers.microsoft.com/global/en/job/${job.jobId}`,
          });
        }

        if (jobs.length >= result.totalJobs || result.jobs.length < pageSize) {
          break;
        }

        page++;
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
