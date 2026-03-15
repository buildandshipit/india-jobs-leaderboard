import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import JobList from '@/components/JobList';
import { Job } from '@/types';

interface Props {
  params: { slug: string };
  searchParams: { search?: string };
}

export const dynamic = 'force-dynamic';

async function getCompanyData(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
  });

  if (!company) {
    return null;
  }

  const jobs = await prisma.job.findMany({
    where: {
      companyId: company.id,
      isActive: true,
    },
    orderBy: { scrapedAt: 'desc' },
  });

  const lastScrape = await prisma.scrapeLog.findFirst({
    where: { companyId: company.id },
    orderBy: { createdAt: 'desc' },
  });

  return { company, jobs, lastScrape };
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const data = await getCompanyData(params.slug);

  if (!data) {
    notFound();
  }

  const { company, jobs, lastScrape } = data;

  // Filter jobs if search query is provided
  let filteredJobs = jobs;
  if (searchParams.search) {
    const search = searchParams.search.toLowerCase();
    filteredJobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(search) ||
        job.location.toLowerCase().includes(search) ||
        job.department?.toLowerCase().includes(search)
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboard
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {jobs.length.toLocaleString()} open positions in India
            </p>
            {lastScrape && (
              <p className="text-sm text-gray-400 mt-1">
                Last updated: {new Date(lastScrape.createdAt).toLocaleString()}
              </p>
            )}
          </div>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Visit Careers Site
          </a>
        </div>
      </div>

      <div className="mb-6">
        <form className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search jobs by title, location, or department..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {searchParams.search && (
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Showing {filteredJobs.length} results for "{searchParams.search}"
          <Link href={`/companies/${params.slug}`} className="ml-2 text-blue-600 hover:underline">
            Clear
          </Link>
        </div>
      )}

      <JobList jobs={filteredJobs as Job[]} />
    </div>
  );
}
