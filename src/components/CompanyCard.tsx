'use client';

import Image from 'next/image';
import { LeaderboardEntry } from '@/types';

interface CompanyCardProps {
  entry: LeaderboardEntry;
}

const rankColors: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-gray-100 text-gray-700 border-gray-300',
  3: 'bg-orange-100 text-orange-800 border-orange-300',
};

const rankEmojis: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export default function CompanyCard({ entry }: CompanyCardProps) {
  const { rank, company, jobCount, lastScraped } = entry;
  const rankStyle = rankColors[rank] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${rankStyle}`}>
          {rankEmojis[rank] || (
            <span className="text-lg font-bold">{rank}</span>
          )}
        </div>

        {/* Company Logo */}
        <div className="w-12 h-12 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
          {company.logo ? (
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              fill
              className="object-contain p-1"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {company.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {company.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lastScraped
              ? `Updated ${new Date(lastScraped).toLocaleDateString()}`
              : 'Not scraped yet'}
          </p>
        </div>

        {/* Job Count */}
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {jobCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            open positions
          </div>
        </div>
      </div>
    </div>
  );
}
