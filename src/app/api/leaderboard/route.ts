import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { LeaderboardEntry } from '@/types';

export async function GET() {
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

    const leaderboard: LeaderboardEntry[] = companies
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

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
