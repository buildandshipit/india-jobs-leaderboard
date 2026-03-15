'use client';

import Link from 'next/link';
import { LeaderboardEntry } from '@/types';
import CompanyCard from './CompanyCard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No data available yet. Click "Refresh Data" to scrape job listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Link key={entry.company.id} href={`/companies/${entry.company.slug}`}>
            <CompanyCard entry={entry} />
          </Link>
        ))}
      </div>
    </div>
  );
}
