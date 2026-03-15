export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string;
  jobCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  externalId: string;
  title: string;
  location: string;
  department: string | null;
  experience: string | null;
  url: string;
  companyId: string;
  company?: Company;
  scrapedAt: Date;
  isActive: boolean;
}

export interface ScrapeLog {
  id: string;
  companyId: string;
  status: 'success' | 'failed';
  jobsFound: number;
  duration: number;
  error: string | null;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  company: Company;
  jobCount: number;
  lastScraped: Date | null;
}

export interface ScrapedJob {
  externalId: string;
  title: string;
  location: string;
  department?: string;
  experience?: string;
  url: string;
}

export interface ScraperResult {
  success: boolean;
  jobs: ScrapedJob[];
  error?: string;
}
