import { createClient } from '@supabase/supabase-js';
import { ViatorClient } from './client';
import { ViatorDestination, ViatorProduct } from './types';

// Initialize Supabase (Use service role if available for backend ops, but client needs safe env check)
// In a real API route, we'd use 'process.env.SUPABASE_SERVICE_ROLE_KEY'
// logic here assumes this is running in a server context (Node/Next API).

const getSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

// Helper for Haversine distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function findNearestDestination(lat: number, lng: number, destinations: ViatorDestination[]) {
    let nearest = null;
    let minDistance = Infinity;

    if (!lat || !lng) return null;

    for (const dest of destinations) {
        const destLat = dest.center?.latitude;
        const destLng = dest.center?.longitude;

        if (destLat && destLng) {
            const distance = calculateDistance(lat, lng, destLat, destLng);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = dest;
            }
        }
    }

    // Only return destination if it's within 100km
    return minDistance <= 100 ? nearest : null;
}

// Logic to sync specific sites
export async function syncSites(siteIds: string[] | null, searchQuery: string | null) {
    const supabase = getSupabase();
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) throw new Error("VIATOR_API_KEY is missing");

    const viatorClient = new ViatorClient(apiKey);

    // 1. Fetch sites
    let query = supabase.from('sites').select('id, name, location');

    if (siteIds && siteIds.length > 0) {
        query = query.in('id', siteIds);
    } else if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%`);
    } else {
        query = query.limit(10); // Default safety limit
    }

    const { data: sites, error } = await query;
    if (error) throw error;
    if (!sites || sites.length === 0) return { message: "No sites found" };

    // 2. Fetch all Viator destinations (optimized: ideally cash this or check DB first)
    // For now, mirroring old script behavior of fetching fresh
    const destinations = await viatorClient.fetchAllDestinations();

    // Store destinations (cache them)
    // Note: old script logic for upserting viator_destinations
    const destinationsToStore = destinations.map(dest => ({
        destination_id: dest.destinationId.toString(),
        destination_name: dest.name,
        latitude: dest.center?.latitude || null,
        longitude: dest.center?.longitude || null,
        parent_id: dest.parentDestinationId?.toString() || null,
        lookup_id: dest.lookupId,
        destination_type: dest.type,
        primary_url: dest.destinationUrl,
        last_updated: new Date().toISOString()
    }));

    await supabase.from('viator_destinations').upsert(destinationsToStore, { onConflict: 'destination_id' });

    // 3. Process sites
    const results = [];
    for (const site of sites) {
        const lat = site.location?.coordinates?.[1];
        const lng = site.location?.coordinates?.[0];

        if (!lat || !lng) {
            results.push({ site: site.name, status: "skipped_no_coords" });
            continue;
        }

        const nearestDest = await findNearestDestination(lat, lng, destinations);

        if (!nearestDest) {
            results.push({ site: site.name, status: "no_nearby_destination" });
            continue;
        }

        try {
            const tours = await viatorClient.fetchToursForDestination(nearestDest.destinationId.toString(), site.name);

            if (tours.length > 0) {
                const toursData = tours.map((tour: ViatorProduct) => ({
                    site_id: site.id,
                    tour_id: tour.productCode,
                    title: tour.title,
                    description: tour.description || '',
                    price: tour.pricing?.summary?.fromPrice || null,
                    currency: tour.pricing?.currency || 'USD',
                    url: tour.productUrl,
                    image_url: tour.images?.[0]?.variants?.find((v) => v.height === 480)?.url || '',
                    rating: tour.reviews?.sources?.[0]?.averageRating || null,
                    review_count: tour.reviews?.totalReviews || 0,
                    last_updated: new Date().toISOString()
                }));

                await supabase.from('viator_tours').upsert(toursData);
                results.push({ site: site.name, toursFound: tours.length, status: "updated" });
            } else {
                results.push({ site: site.name, status: "no_tours_found" });
            }

        } catch (e: unknown) { // Changed to unknown for better type safety
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            console.error(`Error processing ${site.name}:`, errorMessage);
            results.push({ site: site.name, status: "error", error: errorMessage });
        }
    }

    return results;
}
