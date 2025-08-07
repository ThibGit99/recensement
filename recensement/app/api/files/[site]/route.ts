import { NextResponse } from 'next/server';
import fs from 'fs/promises'; // Use promises API
import path from 'path';
import { SITE_NAMES } from '@/lib/site';

export async function GET(
  request: Request,
  { params }: { params: { site: string } }
) {
  console.log('📥 API /api/files/:site called with:', params.site);
  const site = params.site;
  const folder = path.join(process.cwd(), 'importer', site);

  try {
    // Check if folder exists
    await fs.access(folder);

    const files = await fs.readdir(folder);
    const result = [];

    for (const name of files) {
      if (name.endsWith('.7z')) {
        const fullPath = path.join(folder, name);
        const stats = await fs.stat(fullPath);
        const datePart = name.replace('.7z', '');

        result.push({
          name,
          date: datePart,
          modified: stats.mtime.toISOString(),
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    // If folder doesn't exist or other error, respond with empty array
    return NextResponse.json([], { status: 200 });
  }
}
