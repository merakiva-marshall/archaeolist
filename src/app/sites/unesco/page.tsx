import { Suspense } from 'react';
import { Metadata } from 'next'
import { generateBaseMetadata } from '../../../lib/metadata'
import UnescoSitesClient from '../../../components/UnescoSitesClient'
import { getSites, getSiteMetadata, ITEMS_PER_PAGE } from '../../../lib/sites'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/supabase'

export const revalidate = 3600;

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UnescoPage({ searchParams }: PageProps) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const countries = typeof searchParams.countries === 'string' ? searchParams.countries.split(',') : [];

    // Parallel fetch: Sites (Paginated) + Metadata + Hero Image
    // Hero: explicitly fetch Giza or fallback to a featured unesco site
    const heroPromise = supabase
        .from('sites')
        .select('images, name')
        .eq('is_unesco', true)
        .ilike('name', '%giza%')
        .limit(1)
        .single();

    // Fallback hero if Giza fails
    const fallbackHeroPromise = supabase
        .from('sites')
        .select('images, name')
        .eq('is_unesco', true)
        .eq('featured', true)
        .limit(1)
        .single();

    const [sitesResult, metadata, heroResult, fallbackHero] = await Promise.all([
        getSites({
            page,
            limit: ITEMS_PER_PAGE,
            countries,
            unesco: true,
            sort: 'featured'
        }),
        getSiteMetadata(),
        heroPromise,
        fallbackHeroPromise
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heroSite = (heroResult.data || fallbackHero.data) as any;
    const heroImageUrl = heroSite?.images?.[0]?.url || null;

    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading UNESCO sites...</div>}>
            <UnescoSitesClient
                initialSites={sitesResult.sites}
                totalCount={sitesResult.count}
                metadata={metadata}
                currentPage={page}
                itemsPerPage={ITEMS_PER_PAGE}
                heroImage={heroImageUrl}
                content={{
                    title: "UNESCO World Heritage Sites",
                    description: "Preserving Our Shared Heritage"
                }}
            />
        </Suspense>
    );
}
