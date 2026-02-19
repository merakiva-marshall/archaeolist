import { Suspense } from 'react';
import { Metadata } from 'next'
import { generateBaseMetadata } from '../../lib/metadata'
import AllSitesClient from '../../components/AllSitesClient'
import { getSites, getSiteMetadata, ITEMS_PER_PAGE } from '../../lib/sites'

export const revalidate = 86400; // Cache for 24 hours

export async function generateMetadata(): Promise<Metadata> {
    return generateBaseMetadata({
        title: 'All Archaeological Sites | Archaeolist',
        description: 'Explore our comprehensive directory of archaeological sites from around the world. Filter by country and time period to discover ancient history.',
        path: '/sites',
        keywords: 'archaeological sites, ancient ruins, historical sites, all sites, site directory',
        additionalOpenGraph: {
            type: 'website',
            locale: 'en_US'
        }
    });
}

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AllSitesPage({ searchParams }: PageProps) {
    // Parse params
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const countries = typeof searchParams.countries === 'string' ? searchParams.countries.split(',') : [];
    const periods = typeof searchParams.periods === 'string' ? searchParams.periods.split(',') : [];
    const features = typeof searchParams.features === 'string' ? searchParams.features.split(',') : [];
    const unesco = searchParams.unesco === 'true';
    const sort = typeof searchParams.sort === 'string'
        ? (searchParams.sort as 'featured' | 'recent' | 'updated_desc' | 'updated_asc')
        : 'featured';

    // Fetch data
    const [sitesResult, metadata] = await Promise.all([
        getSites({
            page,
            limit: ITEMS_PER_PAGE,
            countries,
            periods,
            features,
            unesco,
            sort
        }),
        getSiteMetadata()
    ]);

    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading sites...</div>}>
            <AllSitesClient
                initialSites={sitesResult.sites}
                totalCount={sitesResult.count}
                metadata={metadata}
                currentPage={page}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </Suspense>
    );
}
