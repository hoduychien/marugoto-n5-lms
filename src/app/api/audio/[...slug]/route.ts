import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const baseDir = path.resolve(
      process.cwd(),
      'docs',
      'MarugotoStarterCompetencesMp3'
    );
    const targetPath = path.resolve(baseDir, ...params.slug);

    // Bảo vệ chống Path Traversal
    if (!targetPath.startsWith(baseDir) || !targetPath.endsWith('.mp3')) {
      return NextResponse.json({ error: 'Invalid audio path' }, { status: 400 });
    }

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    const stat = fs.statSync(targetPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileBuffer = Buffer.alloc(chunkSize);
      const fd = fs.openSync(targetPath, 'r');
      fs.readSync(fd, fileBuffer, 0, chunkSize, start);
      fs.closeSync(fd);

      return new NextResponse(fileBuffer, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const fileBuffer = fs.readFileSync(targetPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to stream audio file' },
      { status: 500 }
    );
  }
}
