import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { site: string } }
) {
  const site = params.site;
  const folder = path.join(process.cwd(), 'importer', site);

  if (!fs.existsSync(folder)) {
    return NextResponse.json([], { status: 200 });
  }

  const files = fs
    .readdirSync(folder)
    .filter(name => name.endsWith('.7z'))
    .map(name => {
      const fullPath = path.join(folder, name);
      const stats = fs.statSync(fullPath);
      const datePart = name.replace('.7z', '');

      return {
        name,
        date: datePart,
        modified: stats.mtime.toISOString(),
      };
    });

  return NextResponse.json(files);
}