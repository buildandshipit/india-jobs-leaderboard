import { PrismaClient } from '@prisma/client';

// Import scrapers using relative path since we're running with tsx
const scrapers = [
  {
    name: 'Microsoft',
    slug: 'microsoft',
    website: 'https://careers.microsoft.com',
    logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    website: 'https://amazon.jobs',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    name: 'Apple',
    slug: 'apple',
    website: 'https://jobs.apple.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  },
  {
    name: 'Google',
    slug: 'google',
    website: 'https://careers.google.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  },
];

const prisma = new PrismaClient();

async function main() {
  console.log('Starting job scrape...\n');

  // Seed companies if they don't exist
  for (const company of scrapers) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      create: {
        name: company.name,
        slug: company.slug,
        website: company.website,
        logo: company.logo,
      },
      update: {},
    });
    console.log(`Ensured company exists: ${company.name}`);
  }

  // Call the API to trigger scraping
  console.log('\nTo scrape jobs, run the dev server and call:');
  console.log('  curl -X POST http://localhost:3000/api/scrape');
  console.log('\nOr from the web UI, click the "Refresh Data" button.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
