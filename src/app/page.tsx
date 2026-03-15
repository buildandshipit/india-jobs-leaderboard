import { prisma } from '@/lib/db';
import Leaderboard from '@/components/Leaderboard';
import { LeaderboardEntry } from '@/types';

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            jobs: {
              where: { isActive: true },
            },
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return companies
      .map((company) => ({
        rank: 0,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          logo: company.logo,
          website: company.website,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        },
        jobCount: company._count.jobs,
        lastScraped: company.logs[0]?.createdAt || null,
      }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tech Company Rankings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Companies ranked by number of open positions in India
        </p>
      </div>

      <Leaderboard entries={leaderboard} />

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          About this leaderboard
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Data is scraped from official career pages. Click "Refresh Data" to
          update job counts. Click on a company to see all open positions.
        </p>
      </div>
    </div>
  );
}
