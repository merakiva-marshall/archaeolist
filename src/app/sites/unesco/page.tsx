
import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'
import { Database } from '../../../types/supabase'
import { Site } from '../../../types/site'
import { generateBaseMetadata } from '../../../lib/metadata'
import UnescoSitesClient from '../../../components/UnescoSitesClient'

export const revalidate = 86400; // Cache for 24 hours

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getUnescoSites(): Promise<Site[]> {
    // Fetch sites with is_unesco = true
    // Optimization: Select only necessary fields for the card view
    const { data, error } = await supabase
        .from('sites')
        .select(`
      id,
      name,
      slug,
      country,
      country_slug,
      short_description,
      images,
      is_unesco,
      created_at,
      description,
      timeline,
      period,
      features
    `)
        .eq('is_unesco', true);

    if (error) {
        console.error('Error fetching UNESCO sites:', error);
        return [];
    }

    const sites = data as unknown as Site[];

    // Calculate completeness score for sorting
    // Score = presence of key fields
    const sitesWithScore = sites.map(site => {
        let score = 0;
        if (site.description) score += 5;
        if (site.short_description) score += 3;
        if (site.images && site.images.length > 0) score += 5;
        if (site.timeline) score += 2;
        if (site.period && site.period.length > 0) score += 2;
        if (site.features && site.features.length > 0) score += 2;
        return { ...site, _score: score };
    });

    // Sort by score (desc), then by created_at (desc)
    return sitesWithScore.sort((a, b) => {
        if (b._score !== a._score) {
            return b._score - a._score;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
}

export async function generateMetadata(): Promise<Metadata> {
    return generateBaseMetadata({
        title: 'UNESCO World Heritage Archaeological Sites | Archaeolist',
        description: 'Explore our comprehensive list of UNESCO World Heritage archaeological sites. Discover ancient ruins, historical landmarks, and cultural treasures preserved for humanity.',
        path: '/sites/unesco',
        keywords: 'UNESCO sites, world heritage sites, archaeological sites, ancient ruins, historical landmarks, cultural heritage',
        additionalOpenGraph: {
            type: 'website',
            locale: 'en_US'
        }
    });
}

import { Suspense } from 'react';

export default async function UnescoPage() {
    const sites = await getUnescoSites();

    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading UNESCO sites...</div>}>
            <UnescoSitesClient
                initialSites={sites}
                content={{
                    title: "UNESCO World Heritage Sites",
                    description: "Preserving Our Shared Heritage"
                }}
            />
        </Suspense>
    );
}
