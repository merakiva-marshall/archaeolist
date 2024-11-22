import { NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!INDEXNOW_KEY || !SITE_URL) {
      console.error('Missing required environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      )
    }

    // Validate request
    const body = await request.json()
    if (!body.urls || !Array.isArray(body.urls)) {
      return NextResponse.json(
        { error: 'Invalid request format' }, 
        { status: 400 }
      )
    }

    // Submit to IndexNow
    const response = await fetch('https://api.indexnow.org/v1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname, // Changed from .host to .hostname
        key: INDEXNOW_KEY,
        urlList: body.urls
      })
    })

    if (!response.ok) {
      throw new Error(`IndexNow API returned ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('IndexNow error:', error)
    return NextResponse.json(
      { error: 'Failed to submit URLs' }, 
      { status: 500 }
    )
  }
}