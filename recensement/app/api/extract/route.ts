import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(req: NextRequest) {
  const site = req.nextUrl.searchParams.get('site');
  const date = req.nextUrl.searchParams.get('date');

  if (!site || !date) {
    return NextResponse.json({ error: 'Missing site or date' }, { status: 400 });
  }

  const scriptPath = path.join(process.cwd(), 'extract.ps1');

  return new Promise((resolve) => {
    const ps = spawn('powershell.exe', [
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-Site',
      site,
      '-DateStr',
      date,
    ]);

    let output = '';
    let errorOutput = '';

    ps.stdout.on('data', (data) => {
      output += data.toString();
    });

    ps.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ps.on('close', (code) => {
      if (code === 0) {
        resolve(NextResponse.json({ success: true, output }));
      } else {
        resolve(NextResponse.json({ success: false, error: errorOutput || output }, { status: 500 }));
      }
    });
  });
}
