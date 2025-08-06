import SiteClient from '../api/files/[site]/SiteClient';
import { SITE_NAMES, SITE_LABELS } from '@/lib/site';

export default function SitePage({ params }: { params: { site: string } }) {
  const { site } = params;

  const siteKey = Object.keys(SITE_NAMES).find(
    key => SITE_NAMES[key] === site
  );

  if (!siteKey) {
    return <div>Site inconnu</div>;
  }

  return (
    <main>
      <h1>{SITE_LABELS[siteKey]}</h1>
      <SiteClient siteKey={siteKey} />
    </main>
  );
}
