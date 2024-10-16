// src/app/lib/supabase.ts


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Site = {
  id: string
  name: string
  slug: string
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  address: string
  period: string[]
  features: string[]
  images: {
    url: string
    alt: string
  }[]
  metadata: Record<string, unknown>  // Changed 'any' to 'unknown'
}

export async function getSites(bounds?: [number, number, number, number]): Promise<Site[]> {
  let query = supabase
    .from('sites')
    .select('*')
  
  if (bounds) {
    query = query.filter('location', 'st_within', 
      `ST_MakeEnvelope(${bounds.join(',')}, 4326)`)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  if (!data) return []
  return data as Site[]
}