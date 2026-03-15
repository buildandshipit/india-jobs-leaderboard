import { BaseScraper } from './base';
import { ScrapedJob, ScraperResult } from '@/types';
import * as cheerio from 'cheerio';

interface GoogleJob {
  id: string;
  title: string;
  location: string;
  department?: string;
}

export class GoogleScraper extends BaseScraper {
  companyName = 'Google';
  companySlug = 'google';
  companyWebsite = 'https://careers.google.com';
  companyLogo = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg';

  async scrape(): Promise<ScraperResult> {
    const jobs: ScrapedJob[] = [];
    let page = 1;
    const pageSize = 20;

    try {
      // Google uses a JSON API that can be accessed directly
      while (true) {
        const url = `https://careers.google.com/api/v3/search/`;
        const params = new URLSearchParams({
          location: 'India',
          page: page.toString(),
          page_size: pageSize.toString(),
          hl: 'en_US',
        });

        const response = await this.fetchWithRetry(async () => {
          const res = await fetch(`${url}?${params}`, {
            headers: {
              'User-Agent': this.userAgent,
              Accept: 'application/json',
            },
          });

          if (!res.ok) {
            // Fallback to scraping if API doesn't work
            return this.scrapeHtml();
          }

          return res.json();
        });

        // If we got an HTML response (fallback), return it directly
        if (response.fromHtmlScrape) {
          return response;
        }

        const jobsList = response.jobs || [];
        if (jobsList.length === 0) {
          break;
        }

        for (const job of jobsList) {
          const locations = job.locations?.map((l: any) => l.display).join(', ') || 'India';

          jobs.push({
            externalId: job.id,
            title: job.title,
            location: this.normalizeLocation(locations),
            department: job.categories?.[0]?.display,
            url: `https://careers.google.com/jobs/results/${job.id}`,
          });
        }

        if (response.count && jobs.length >= response.count) {
          break;
        }

        if (jobsList.length < pageSize) {
          break;
        }

        page++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return { success: true, jobs };
    } catch (error) {
      // Fallback to HTML scraping
      try {
        return await this.scrapeHtml();
      } catch (scrapeError) {
        return {
          success: false,
          jobs: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }

  private async scrapeHtml(): Promise<ScraperResult> {
    // Fallback scraper using Puppeteer - in a production environment
    // This would use Puppeteer to render the JavaScript
    // For now, we'll return a simulated result indicating the API wasn't available

    // Note: Google's careers site requires JavaScript rendering
    // A full implementation would need Puppeteer:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto('https://careers.google.com/jobs/results/?location=India');
    // ... extract job cards ...

    return {
      success: false,
      jobs: [],
      error: 'Google scraping requires Puppeteer - API not available',
      // @ts-ignore
      fromHtmlScrape: true,
    };
  }
}
