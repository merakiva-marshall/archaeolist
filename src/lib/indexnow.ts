import { supabase } from './supabase'

const BATCH_SIZE = 100
const BATCH_DELAY = 1000 // 1 second between batches

export async function submitToIndexNow(urls: string[]) {
  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urls.filter(url => url && url.startsWith('http')) }),
    })
    
    if (!response.ok) throw new Error('IndexNow submission failed')
    return await response.json()
  } catch (error) {
    console.error('Error submitting to IndexNow:', error)
    return null
  }
}

export async function submitAllSitesToIndexNow() {
  try {
    const { data: sites, error } = await supabase
      .from('sites')
      .select('country_slug, slug')
    
    if (error) throw error;
    if (!sites?.length) return;

    const urls = sites.map(site => 
      `${process.env.NEXT_PUBLIC_SITE_URL}/sites/${site.country_slug}/${site.slug}`
    ).filter(url => url && url.startsWith('http'));

    // Process in batches with delay
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      await submitToIndexNow(batch);
      if (i + BATCH_SIZE < urls.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return { submitted: urls.length };
  } catch (error) {
    console.error('Error submitting all sites to IndexNow:', error);
    throw error;
  }
}
