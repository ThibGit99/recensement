'use client';

import { useEffect, useState } from 'react';
import SiteCalendar from '@/components/SiteCalendar';
import { SITE_NAMES, SITE_LABELS } from '@/lib/site';

export default function SitePage({ params }: { params: { site: string } }) {
  const { site } = params;

  // Find the site key from the site name
  const siteKey = Object.keys(SITE_NAMES).find(key => SITE_NAMES[key] === site);

  if (!siteKey) {
    return <div>site inconnu</div>;
  }

  // State to hold the list of files
  const [files, setFiles] = useState<any[]>([]);

  // Fetch files on component mount - utilise la route correcte
  useEffect(() => {
    fetch(`/api/files/${site}`)
        .then(async res => {
    const text = await res.text(); // on lit la réponse brute
    console.log('Réponse brute (files):', text); // pour debug
    try {
      return JSON.parse(text); // on essaie de parser manuellement
    } catch (err) {
      console.error('Erreur de parsing JSON (files):', err);
      throw new Error('Réponse invalide du serveur');
    }
  })
      .then(data => {
        setFiles(data);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });
  }, [site]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{SITE_LABELS[siteKey]}</h1>
      <SiteCalendar site={site} files={files} />
    </main>
  );
}