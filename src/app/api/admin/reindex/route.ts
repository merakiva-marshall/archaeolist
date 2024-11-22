import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { submitAllSitesToIndexNow } from '@/lib/indexnow'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sites } = await supabase
      .from('sites')
      .select('country_slug, slug')

    if (!sites) {
      return NextResponse.json({ error: 'No sites found' }, { status: 404 })
    }

    // Actually use the urls we generate
    const result = await submitAllSitesToIndexNow()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Reindex error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}