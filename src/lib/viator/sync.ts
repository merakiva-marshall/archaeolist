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
export async function syncSites(siteIds: string[] | null, searchQuery: string | null, limit: number = 5) {
    const supabase = getSupabase();
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) throw new Error("VIATOR_API_KEY is missing");

    const viatorClient = new ViatorClient(apiKey);

    // 1. Fetch sites
    let query = supabase.from('sites').select('id, name, location, last_viator_sync');

    if (siteIds && siteIds.length > 0) {
        query = query.in('id', siteIds);
    } else if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%`);
    } else {
        // Fetch sites that haven't been synced locally OR were synced more than 24 hours ago
        // Default sort: Oldest sync first (nulls first)
        // This naturally prioritizes "never synced" and "oldest synced".
        query = query.order('last_viator_sync', { ascending: true, nullsFirst: true }).limit(limit);
    }

    const { data: sites, error } = await query;
    if (error) throw error;
    if (!sites || sites.length === 0) return { message: "No sites found" };

    // 2. Fetch Viator destinations (Cache-first strategy)
    // Check if we have destinations in DB
    const { data: localDestinations } = await supabase.from('viator_destinations').select('*');

    let destinations = [];
    if (localDestinations && localDestinations.length > 0) {
        console.log(`Using ${localDestinations.length} local destinations.`);
        // Map back to ViatorDestination shape if needed, or adjust findNearest to work with DB shape.
        // Since logic uses ViatorDestination interface, let's map DB -> Interface.
        // Actually, we need to ensure types match.
        // For simplicity in this fix, let's just use the API fetch if DB is empty to populate it once.
        // But to properly use local, we need to map the fields.
        destinations = localDestinations.map(d => ({
            destinationId: parseInt(d.destination_id),
            name: d.destination_name,
            type: d.destination_type,
            parentDestinationId: d.parent_id ? parseInt(d.parent_id) : null,
            lookupId: d.lookup_id,
            destinationUrl: d.primary_url,
            center: { latitude: d.latitude, longitude: d.longitude }
            /* eslint-disable @typescript-eslint/no-explicit-any */
        })) as any; // Cast to bypass strict strict ViatorDestination checks for now
    } else {
        console.log("Fetching fresh destinations from Viator...");
        destinations = await viatorClient.fetchAllDestinations();

        // Store destinations
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

        const { error: destError } = await supabase.from('viator_destinations').upsert(destinationsToStore, { onConflict: 'destination_id' });
        if (destError) console.error("Error storing destinations:", destError);
        else console.log(`Stored ${destinationsToStore.length} destinations.`);
    }

    // destinations is now populated either from DB or API


    // 3. Process sites
    const results = [];
    for (const site of sites) {
        const lat = site.location?.coordinates?.[1];
        const lng = site.location?.coordinates?.[0];

        if (!lat || !lng) {
            results.push({ site: site.name, status: "skipped_no_coords" });
            // Mark as synced so we don't retry immediately? Maybe set status 'skipped'
            await supabase.from('sites').update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'skipped_no_coords' }).eq('id', site.id);
            continue;
        }

        const nearestDest = await findNearestDestination(lat, lng, destinations);

        if (!nearestDest) {
            results.push({ site: site.name, status: "no_nearby_destination" });
            await supabase.from('sites').update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'no_dest_100km' }).eq('id', site.id);
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
                await supabase.from('sites').update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'synced_found' }).eq('id', site.id);
                results.push({ site: site.name, toursFound: tours.length, status: "updated" });
            } else {
                await supabase.from('sites').update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'synced_no_tours' }).eq('id', site.id);
                results.push({ site: site.name, status: "no_tours_found" });
            }

        } catch (e: unknown) { // Changed to unknown for better type safety
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            console.error(`Error processing ${site.name}:`, errorMessage);
            await supabase.from('sites').update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'error' }).eq('id', site.id);
            results.push({ site: site.name, status: "error", error: errorMessage });
        }
    }

    return results;
}
