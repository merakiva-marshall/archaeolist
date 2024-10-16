// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Site } from '../types/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchSites(): Promise<Site[]> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('id, name, description, location, address, period, features, country, slug')

    if (error) {
      console.error('Error fetching sites:', error)
      return []
    }

    if (data) {
      return data.map(site => ({
        id: site.id,
        name: site.name,
        description: site.description,
        location: site.location.coordinates,
        address: site.address,
        period: site.period,
        features: site.features,
        country: site.country,
        slug: site.slug
      }))
    }

    return []
  } catch (error) {
    console.error('Error in fetchSites:', error)
    return []
  }
}