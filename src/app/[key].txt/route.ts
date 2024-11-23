// src/app/[key].txt/route.ts

import { NextResponse } from 'next/server';

// Disable static generation for this route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Add segment config
export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
    
    if (!INDEXNOW_KEY) {
      console.error('INDEXNOW_KEY environment variable is not set');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    if (!params?.key) {
      return new NextResponse('Key parameter is required', { status: 400 });
    }

    if (params.key === INDEXNOW_KEY) {
      return new NextResponse(INDEXNOW_KEY, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Error in [key].txt route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}