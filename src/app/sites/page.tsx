import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'
import { Database } from '../../types/supabase'
import { Site } from '../../types/site'
import { generateBaseMetadata } from '../../lib/metadata'
import AllSitesClient from '../../components/AllSitesClient'

export const revalidate = 86400; // Cache for 24 hours

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getAllSites(): Promise<Site[]> {
    let allSites: Site[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
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
          updated_at,
          description,
          timeline,
          period,
          features,
          processed_features,
          processed_periods
        `)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('Error fetching sites:', error);
            break;
        }

        if (!data || data.length === 0) {
            break;
        }

        allSites = [...allSites, ...(data as unknown as Site[])];

        if (data.length < pageSize) {
            break;
        }

        page++;
    }

    return allSites;
}

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

export default async function AllSitesPage() {
    const sites = await getAllSites();

    return <AllSitesClient initialSites={sites} />;
}
