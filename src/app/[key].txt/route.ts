// src/app/[key].txt/route.ts

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

  if (params.key === INDEXNOW_KEY) {
    return new NextResponse(INDEXNOW_KEY, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}