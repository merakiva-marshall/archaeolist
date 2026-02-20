import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { Site } from '../types/site';

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Constants
export const ITEMS_PER_PAGE = 24;

export interface GetSitesParams {
    page?: number;
    limit?: number;
    countries?: string[];
    periods?: string[];
    features?: string[];
    unesco?: boolean;
    sort?: 'featured' | 'recent' | 'updated_desc' | 'updated_asc';
    search?: string;
}

export interface SitesResult {
    sites: Site[];
    count: number;
}

export interface SiteMetadata {
    countries: { name: string; count?: number }[];
    periods: string[];
    features: string[];
}

export async function getSites({
    page = 1,
    limit = ITEMS_PER_PAGE,
    countries = [],
    periods = [],
    features = [],
    unesco = false,
    sort = 'featured',
    search = ''
}: GetSitesParams): Promise<SitesResult> {
    // Calculate range
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Start query
    let query = supabase
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
      featured,
      processed_features,
      processed_periods
    `, { count: 'exact' })
        .eq('archaeological_site_yn', true);

    // Apply filters
    if (countries.length > 0) {
        query = query.in('country', countries);
    }

    if (unesco) {
        query = query.eq('is_unesco', true);
    }

    // JSONB filters for periods and features
    // Note: This relies on the structure of processed_periods and processed_features
    // We can't easily do "OR" within a JSONB check for multiple periods without more complex logic or raw SQL
    // For now, we'll iterate and apply filters. If multiple selected, we usually want "OR" or "AND"?
    // Client side was "site has SOME of selected periods". usage: selectedPeriods.includes(p)
    // So if I select "Bronze Age", I want sites with Bronze Age.
    // If I select "Bronze Age" and "Iron Age", I probably want sites with either? Or both?
    // Use array-contains logic if possible, or simple looping.
    // Supabase/Postgrest `cs` (contains) operator works for JSONB arrays.
    // But processed_periods is a Map/Object `{ "Bronze Age": [...] }`.
    // So we can check if keys exist.
    // Unfortunately checking if ANY key exists from a list in a JSONB object is tricky in standard Postgrest.
    // Simplified approach: If 1 period selected, filter for it. If multiple, it's harder in pure Postgrest without RPC.
    // Lets assume for now the user selects one or we try to filter optimally.
    // Actually, standard Postgrest doesn't support "jsonb key in array" well.
    // We might have to load slightly more and filter or use a raw query (rpc).
    // FOR NOW: Let's assume we filter efficiently for valid columns.
    // Improving search:
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // NOTE: Complex JSONB filtering for multiple periods/features is a known Postgrest limitation without Views/RPC.
    // We will apply the Country/Unesco filters strictly (SQL).
    // For Periods/Features, if we can't easily filter in SQL without writing a function, 
    // we might have to filter in memory IF the dataset was small, but here we want pagination.
    // Solution: Use the `contains` operator if we convert selection to expected JSON structure? No.
    // Alternative: Use `text` casting if simple keys. `.ilike('processed_periods::text', '%PeriodName%')`
    // This is a "good enough" hack for search.

    if (periods.length > 0) {
        // This implies AND if we chain them. We probably want OR.
        // `.or()` syntax: `or(processed_periods.cs.{"PeriodA":[]},processed_periods.cs.{"PeriodB":[]})`
        const orQuery = periods.map(p => `processed_periods.cs.{"${p}":[]}`).join(',');
        query = query.or(orQuery);
    }

    if (features.length > 0) {
        const orQuery = features.map(f => `processed_features.cs.{"${f}":[]}`).join(',');
        query = query.or(orQuery);
    }

    // Sort
    switch (sort) {
        case 'featured':
            // Sort by featured boolean first (desc), then created_at (desc)
            query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
            break;
        case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
        case 'updated_desc':
            query = query.order('updated_at', { ascending: false });
            break;
        case 'updated_asc':
            query = query.order('updated_at', { ascending: true });
            break;
        default:
            query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching sites:', error);
        throw error;
    }

    return {
        sites: (data as unknown as Site[]) || [],
        count: count || 0
    };
}

export async function getSiteMetadata(): Promise<SiteMetadata> {
    // Fetch unique countries
    // To be efficient, we might want a distinct query or use a cached list.
    // For now, we'll fetch just countries column from all sites? No that's still 6000 rows.
    // Better: use a distinct select if possible or a dedicated table.
    // Supabase JS doesn't do "select distinct" easily on a column without `rpc` or hacks.
    // Hack: Fetch all small payload and process (still better than fetching full objects).
    // OR: Just hardcode/cache commonly used ones?
    // Let's try fetching just country column. 6000 strings is tiny (~100KB gzipped).

    // Cached separate request
    const { data: countriesData } = await supabase
        .from('sites')
        .select('country')
        .eq('archaeological_site_yn', true)
        .not('country', 'is', null);

    const countrySet = new Set<string>();
    countriesData?.forEach((r: { country: string | null }) => {
        if (r.country) countrySet.add(r.country);
    });

    // For periods and features, we would need to aggregate from JSON.
    // This is expensive to do every request.
    // Ideally we have a constants file or a summary table.
    // We already have `PERIOD_ORDER` in the client. We can move it here.
    const PERIODS = [
        "Paleolithic", "Mesolithic", "Neolithic", "Chalcolithic",
        "Bronze Age", "Iron Age", "Classical Period",
        "Post-Classical Period", "Early Modern Period",
        "Industrial Period", "Contemporary Period"
    ];

    // Features is harder as it's dynamic.
    // For now returning empty features or common ones?
    // Let's try to just return the static/derived lists we know.
    // If we want real data, we really need an RPC function `get_site_metadata`.
    // I will write this without RPC first using known data to unblock.

    return {
        countries: Array.from(countrySet).sort().map(name => ({ name })),
        periods: PERIODS,
        features: [] // TODO: Populate if critical, or use client-side accumulation if we accept some drift
    };
}
