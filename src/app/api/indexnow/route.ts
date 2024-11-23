import { NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
const isDevelopment = process.env.NODE_ENV === 'development'

export async function POST(request: Request) {
  try {
    if (!INDEXNOW_KEY || !SITE_URL) {
      throw new Error('Missing required environment variables')
    }

    const { urls } = await request.json()
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('Invalid or empty URLs array')
    }

    const siteHostname = new URL(SITE_URL).hostname
    
    // Validate all URLs
    const invalidUrls = urls.filter(url => {
      try {
        const urlHostname = new URL(url).hostname;
        return urlHostname !== siteHostname;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      throw new Error(`Invalid URLs detected. All URLs must belong to ${siteHostname}`);
    }

    const hostname = new URL(SITE_URL).hostname

    if (isDevelopment) {
      console.log('Development mode - IndexNow submission simulated:', {
        host: hostname,
        urlList: urls,
        keyLocation: `https://${hostname}/${INDEXNOW_KEY}.txt`
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Development mode - submission simulated',
        urls: urls 
      });
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: hostname,
        key: INDEXNOW_KEY,
        keyLocation: `https://${hostname}/${INDEXNOW_KEY}.txt`,
        urlList: urls
      })
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('IndexNow API error:', responseText)
      throw new Error(`IndexNow API returned ${response.status}: ${responseText}`)
    }

    return NextResponse.json({ 
      success: true, 
      response: responseText,
      statusCode: response.status,
      urls: urls
    })
  } catch (error) {
    console.error('IndexNow error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}