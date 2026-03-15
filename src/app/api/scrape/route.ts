import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapers, getScraperBySlug } from '@/lib/scrapers';
import { BaseScraper } from '@/lib/scrapers/base';

async function runScraper(scraper: BaseScraper) {
  const startTime = Date.now();

  // Ensure company exists in database
  let company = await prisma.company.findUnique({
    where: { slug: scraper.companySlug },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: scraper.companyName,
        slug: scraper.companySlug,
        website: scraper.companyWebsite,
        logo: scraper.companyLogo,
      },
    });
  }

  // Run the scraper
  const result = await scraper.scrape();
  const duration = Date.now() - startTime;

  if (result.success) {
    // Mark all existing jobs as inactive
    await prisma.job.updateMany({
      where: { companyId: company.id },
      data: { isActive: false },
    });

    // Upsert jobs
    for (const job of result.jobs) {
      await prisma.job.upsert({
        where: {
          companyId_externalId: {
            companyId: company.id,
            externalId: job.externalId,
          },
        },
        create: {
          externalId: job.externalId,
          title: job.title,
          location: job.location,
          department: job.department,
          experience: job.experience,
          url: job.url,
          companyId: company.id,
          isActive: true,
        },
        update: {
          title: job.title,
          location: job.location,
          department: job.department,
          experience: job.experience,
          url: job.url,
          isActive: true,
          scrapedAt: new Date(),
        },
      });
    }
  }

  // Log the scrape
  await prisma.scrapeLog.create({
    data: {
      companyId: company.id,
      status: result.success ? 'success' : 'failed',
      jobsFound: result.jobs.length,
      duration,
      error: result.error,
    },
  });

  return {
    company: scraper.companyName,
    success: result.success,
    jobsFound: result.jobs.length,
    duration,
    error: result.error,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get('company');

    let results;

    if (companySlug) {
      // Scrape specific company
      const scraper = getScraperBySlug(companySlug);
      if (!scraper) {
        return NextResponse.json(
          { error: `Unknown company: ${companySlug}` },
          { status: 400 }
        );
      }
      results = [await runScraper(scraper)];
    } else {
      // Scrape all companies
      results = [];
      for (const scraper of scrapers) {
        const result = await runScraper(scraper);
        results.push(result);
        // Small delay between companies to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const totalJobs = results.reduce((sum, r) => sum + r.jobsFound, 0);
    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `Scraped ${successCount}/${results.length} companies, found ${totalJobs} jobs`,
      results,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: 'Scrape failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Get scrape status/history
  try {
    const logs = await prisma.scrapeLog.findMany({
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Scrape status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scrape status' },
      { status: 500 }
    );
  }
}
