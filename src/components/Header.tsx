'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-2xl">🇮🇳</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                India Tech Jobs
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Leaderboard
              </p>
            </div>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Rankings
            </Link>
            <button
              onClick={async () => {
                const res = await fetch('/api/scrape', { method: 'POST' });
                const data = await res.json();
                alert(data.message || 'Scrape triggered');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh Data
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
