import { createClient } from '@supabase/supabase-js';
import { ViatorClient, ATTRACTION_TAGS, DESTINATION_TAGS } from './client';
import { ViatorDestination, ViatorProduct } from './types';

const getSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

// Helper for Haversine distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
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

    return minDistance <= 100 ? nearest : null;
}

/**
 * Quality gate: only keep tours with enough reviews and a decent rating.
 */
function meetsQualityGate(tour: ViatorProduct): boolean {
    const reviewCount = tour.reviews?.totalReviews ?? 0;
    const rating = tour.reviews?.sources?.[0]?.averageRating ?? 0;
    return reviewCount >= 3 && rating >= 3.5;
}

function mapTourToRow(tour: ViatorProduct, siteId: string, relevanceScore: number) {
    return {
        site_id: siteId,
        tour_id: tour.productCode,
        title: tour.title,
        description: tour.description || '',
        price: tour.pricing?.summary?.fromPrice ?? null,
        currency: tour.pricing?.currency || 'USD',
        url: tour.productUrl,
        image_url: tour.images?.[0]?.variants?.find((v) => v.height === 480)?.url || '',
        rating: tour.reviews?.sources?.[0]?.averageRating ?? null,
        review_count: tour.reviews?.totalReviews ?? 0,
        relevance_score: relevanceScore,
        last_updated: new Date().toISOString(),
    };
}

// Logic to sync specific sites
export async function syncSites(siteIds: string[] | null, searchQuery: string | null, limit: number = 5) {
    const supabase = getSupabase();
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) throw new Error('VIATOR_API_KEY is missing');

    const viatorClient = new ViatorClient(apiKey);

    // 1. Fetch sites
    let query = supabase
        .from('sites')
        .select('id, name, location, last_viator_sync, viator_attraction_id');

    if (siteIds && siteIds.length > 0) {
        query = query.in('id', siteIds);
    } else if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%`);
    } else {
        query = query
            .order('last_viator_sync', { ascending: true, nullsFirst: true })
            .limit(limit);
    }

    const { data: sites, error } = await query;
    if (error) throw error;
    if (!sites || sites.length === 0) return { message: 'No sites found' };

    // 2. Load destinations (cache-first)
    const { data: localDestinations } = await supabase.from('viator_destinations').select('*');

    let destinations: ViatorDestination[] = [];
    if (localDestinations && localDestinations.length > 0) {
        console.log(`Using ${localDestinations.length} cached destinations.`);
        destinations = localDestinations.map(d => ({
            destinationId: parseInt(d.destination_id),
            name: d.destination_name,
            type: d.destination_type,
            parentDestinationId: d.parent_id ? parseInt(d.parent_id) : null,
            lookupId: d.lookup_id,
            destinationUrl: d.primary_url,
            center: { latitude: d.latitude, longitude: d.longitude },
            /* eslint-disable @typescript-eslint/no-explicit-any */
        })) as any;
    } else {
        console.log('Fetching fresh destinations from Viator...');
        destinations = await viatorClient.fetchAllDestinations();

        const destinationsToStore = destinations.map(dest => ({
            destination_id: dest.destinationId.toString(),
            destination_name: dest.name,
            latitude: dest.center?.latitude || null,
            longitude: dest.center?.longitude || null,
            parent_id: dest.parentDestinationId?.toString() || null,
            lookup_id: dest.lookupId,
            destination_type: dest.type,
            primary_url: dest.destinationUrl,
            last_updated: new Date().toISOString(),
        }));

        const { error: destError } = await supabase
            .from('viator_destinations')
            .upsert(destinationsToStore, { onConflict: 'destination_id' });
        if (destError) console.error('Error storing destinations:', destError);
        else console.log(`Stored ${destinationsToStore.length} destinations.`);
    }

    // 3. Process sites with attraction-first strategy
    const results = [];

    for (const site of sites) {
        const lat = site.location?.coordinates?.[1];
        const lng = site.location?.coordinates?.[0];

        if (!lat || !lng) {
            await supabase
                .from('sites')
                .update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'skipped_no_coords' })
                .eq('id', site.id);
            results.push({ site: site.name, status: 'skipped_no_coords' });
            continue;
        }

        try {
            // Step 1: Resolve attraction ID (use cached value or search fresh)
            let attractionId: string | null = site.viator_attraction_id || null;

            if (!attractionId) {
                const attraction = await viatorClient.searchAttractions(site.name);
                if (attraction) {
                    attractionId = attraction;
                    // Cache the attraction key on the site record
                    await supabase
                        .from('sites')
                        .update({ viator_attraction_id: attractionId })
                        .eq('id', site.id);
                    console.log(`  Matched attraction key "${attractionId}" for site "${site.name}"`);
                }
            }

            let tours: ViatorProduct[] = [];
            let relevanceScore: number;

            if (attractionId) {
                // Step 2: Fetch tours by attraction (best quality — tours that specifically visit this site)
                console.log(`  Fetching tours by attraction for "${site.name}"...`);
                tours = await viatorClient.fetchToursByAttraction(attractionId, ATTRACTION_TAGS);
                relevanceScore = 100; // Attraction-matched tours score highest
            } else {
                // Step 3: Fallback to destination + tag filtering
                const nearestDest = await findNearestDestination(lat, lng, destinations);
                if (!nearestDest) {
                    await supabase
                        .from('sites')
                        .update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'no_dest_100km' })
                        .eq('id', site.id);
                    results.push({ site: site.name, status: 'no_nearby_destination' });
                    continue;
                }

                console.log(`  Fetching tours by destination for "${site.name}" (dest: ${nearestDest.name})...`);
                tours = await viatorClient.fetchToursByDestination(
                    nearestDest.destinationId.toString(),
                    DESTINATION_TAGS
                );
                relevanceScore = 50; // Destination-fallback tours score lower
            }

            // Step 4: Quality gate — only store tours with sufficient reviews and rating
            const qualityTours = tours.filter(meetsQualityGate);

            if (qualityTours.length > 0) {
                const toursData = qualityTours.map(tour => mapTourToRow(tour, site.id, relevanceScore));

                await supabase
                    .from('viator_tours')
                    .upsert(toursData, { onConflict: 'site_id,tour_id' });
                await supabase
                    .from('sites')
                    .update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'synced_found' })
                    .eq('id', site.id);

                results.push({
                    site: site.name,
                    toursFound: qualityTours.length,
                    attractionMatched: !!attractionId,
                    status: 'updated',
                });
            } else {
                await supabase
                    .from('sites')
                    .update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'synced_no_tours' })
                    .eq('id', site.id);
                results.push({ site: site.name, status: 'no_tours_found' });
            }

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            console.error(`Error processing ${site.name}:`, errorMessage);
            await supabase
                .from('sites')
                .update({ last_viator_sync: new Date().toISOString(), viator_sync_status: 'error' })
                .eq('id', site.id);
            results.push({ site: site.name, status: 'error', error: errorMessage });
        }
    }

    return results;
}
