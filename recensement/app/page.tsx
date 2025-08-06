import Link from 'next/link';
import { SITE_NAMES, SITE_LABELS } from '@/lib/site';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Recensement des Sites</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(SITE_NAMES).map(([key, siteName]) => (
            <Link
              key={key}
              href={`/site/${siteName}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{SITE_LABELS[key]}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Voir les archives pour {SITE_LABELS[key].toLowerCase()}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Cliquez sur un site pour voir son calendrier d'archives
          </p>
        </div>
      </div>
    </div>
  );
}