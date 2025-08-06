'use client';

import { useEffect, useState } from 'react';
import SiteCalendar from '@/components/SiteCalendar';
import { SITE_NAMES, SITE_LABELS } from '@/lib/site';

export default function SitePage({ params }: { params: { site: string } }) {
  const { site } = params;

  // Find the site key from the site name
  const siteKey = Object.keys(SITE_NAMES).find(key => SITE_NAMES[key] === site);

  if (!siteKey) {
    return <div>Site inconnu</div>;
  }

  // State to hold the list of files
  const [files, setFiles] = useState<any[]>([]);

  // Fetch files on component mount
  useEffect(() => {
    fetch(`/api/your-route/${site}`) // Make sure this matches your route path
      .then(res => res.json())
      .then(data => {
        setFiles(data);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });
  }, [site]);

  return (
    <main>
      <h1>{SITE_LABELS[siteKey]}</h1>
      {/* You can pass `files` to SiteCalendar or display them here */}
      <SiteCalendar site={siteKey} files={files} />
    </main>
  );
}
