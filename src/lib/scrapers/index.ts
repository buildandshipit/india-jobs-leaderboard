import { BaseScraper } from './base';
import { MicrosoftScraper } from './microsoft';
import { AmazonScraper } from './amazon';
import { AppleScraper } from './apple';
import { GoogleScraper } from './google';

export const scrapers: BaseScraper[] = [
  new MicrosoftScraper(),
  new AmazonScraper(),
  new AppleScraper(),
  new GoogleScraper(),
];

export function getScraperBySlug(slug: string): BaseScraper | undefined {
  return scrapers.find((s) => s.companySlug === slug);
}

export { BaseScraper } from './base';
export { MicrosoftScraper } from './microsoft';
export { AmazonScraper } from './amazon';
export { AppleScraper } from './apple';
export { GoogleScraper } from './google';
