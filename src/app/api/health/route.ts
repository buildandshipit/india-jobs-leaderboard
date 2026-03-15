import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get stats
    const [companyCount, jobCount, lastScrape] = await Promise.all([
      prisma.company.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.scrapeLog.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      stats: {
        companies: companyCount,
        activeJobs: jobCount,
        lastScrape: lastScrape?.createdAt || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
