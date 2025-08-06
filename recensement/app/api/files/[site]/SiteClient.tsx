'use client';

import { useEffect, useState } from 'react';
import SiteCalendar from '@/components/SiteCalendar';

export default function SiteClient({ siteKey }: { siteKey: string }) {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/your-route/${siteKey}`)
      .then(res => res.json())
      .then(setFiles)
      .catch(error => {
        console.error('Error fetching files:', error);
      });
  }, [siteKey]);

  return <SiteCalendar site={siteKey} files={files} />;
}
