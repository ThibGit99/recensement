'use client';

import { useEffect, useState } from 'react';
import SiteCalendar from '@/components/SiteCalendar';
import { SITE_NAMES, SITE_LABELS } from '@/lib/site';
import React from 'react';
import { useParams } from 'next/navigation';

export default function SitePage() {
  const params = useParams();
  const site = params.site as string;

  const siteKey = Object.keys(SITE_NAMES).find(key => SITE_NAMES[key] === site);

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!site) return;

    setLoading(true);
    setError(null);

    fetch(`/api/files/${site}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setFiles(data || []);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [site]);

  if (!siteKey) {
    return (
      <div className="p-8">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <h3 className="font-bold">Site inconnu</h3>
          <p>Le site "{site}" n'existe pas.</p>
          <p className="mt-2">Sites disponibles : {Object.values(SITE_NAMES).join(', ')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{SITE_LABELS[siteKey]}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cliquez sur une date du calendrier pour voir et extraire les archives disponibles
        </p>
      </div>

      {loading && (
        <div className="flex items-center space-x-2 mb-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Chargement des archives...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Erreur lors du chargement</h3>
          <p>{error}</p>
        </div>
      )}

      <SiteCalendar site={site} files={files} />
    </main>
  );
}