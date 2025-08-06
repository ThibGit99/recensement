import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: { site: string } }) {
  const site = params.site;
  const baseDir = path.join(process.cwd(), 'public', 'files', site);

  const files: any[] = [];

  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        files.push({
          path: fullPath.replace(path.join(process.cwd(), 'public'), ''),
          name: file,
          modified: stat.mtime,
        });
      }
    }
  };

  walk(baseDir);

  return NextResponse.json(files);
}
