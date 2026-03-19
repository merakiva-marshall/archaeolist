import { ViatorDestinationsResponse, ViatorDestination } from './types';

const VIATOR_BASE_URL = 'https://api.viator.com/partner';

// Tag IDs for archaeological/historical tour filtering
export const VIATOR_TAG_IDS = {
    ARCHAEOLOGY: 12077,
    HISTORICAL: 12029,
    CULTURAL: 12028,
    WALKING: 12046,
    MUSEUM: 11901,
} as const;

// Primary tags for attraction-based search (most specific)
export const ATTRACTION_TAGS = [
    VIATOR_TAG_IDS.ARCHAEOLOGY,
    VIATOR_TAG_IDS.HISTORICAL,
    VIATOR_TAG_IDS.CULTURAL,
];

// Broader tags for destination-based fallback
export const DESTINATION_TAGS = [
    VIATOR_TAG_IDS.ARCHAEOLOGY,
    VIATOR_TAG_IDS.HISTORICAL,
    VIATOR_TAG_IDS.CULTURAL,
    VIATOR_TAG_IDS.WALKING,
];

export class ViatorClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private get headers() {
        return {
            'exp-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
        };
    }

    async fetchAllDestinations(): Promise<ViatorDestination[]> {
        console.log('Fetching all Viator destinations...');
        const response = await fetch(`${VIATOR_BASE_URL}/destinations`, {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Viator API Error Body:', text);
            throw new Error(`Failed to fetch destinations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as ViatorDestinationsResponse;
        console.log(`Fetched ${data.totalCount} destinations`);
        return data.destinations;
    }

    /**
     * Search for Viator attractions by site name.
     * Returns a combined "attractionId|primaryDestinationId" key, or null if not found.
     * The destination is required by the Viator products/search endpoint even with attractionId.
     */
    async searchAttractions(siteName: string): Promise<string | null> {
        const response = await fetch(`${VIATOR_BASE_URL}/search/freetext`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                searchTerm: siteName,
                searchTypes: [{ searchType: 'ATTRACTIONS', pagination: { start: 1, count: 3 } }],
                currency: 'USD',
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Viator attraction search error for "${siteName}":`, text);
            return null;
        }

        const data = await response.json();
        const attractions = data.attractions?.results;
        if (!attractions || attractions.length === 0) return null;

        const top = attractions[0];
        const attrId = top.attractionId ?? top.id;
        const destId = top.primaryDestinationId;
        if (!attrId || !destId) return null;

        // Store as "attractionId|primaryDestinationId" so fetchToursByAttraction has both values
        return `${attrId}|${destId}`;
    }

    /**
     * Fetch tours specifically linked to a Viator attraction.
     * attractionKey must be "attractionId|primaryDestinationId" (from searchAttractions).
     */
    async fetchToursByAttraction(attractionKey: string, tagIds: number[] = ATTRACTION_TAGS) {
        const [attractionId, destId] = attractionKey.split('|');
        const response = await fetch(`${VIATOR_BASE_URL}/products/search`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                filtering: {
                    attractionId: Number(attractionId),
                    destination: destId,
                    tags: tagIds,
                },
                sorting: {
                    sort: 'TRAVELER_RATING',
                    order: 'DESCENDING',
                },
                pagination: {
                    start: 1,
                    count: 30,
                },
                currency: 'USD',
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Viator fetchToursByAttraction error (attractionId=${attractionId}):`, text);
            return [];
        }

        const data = await response.json();
        return data.products || [];
    }

    /**
     * Fetch archaeological/historical tours within a destination.
     * Used as fallback when no Viator attraction match exists for a site.
     */
    async fetchToursByDestination(destId: string, tagIds: number[] = DESTINATION_TAGS) {
        const response = await fetch(`${VIATOR_BASE_URL}/products/search`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                filtering: {
                    destination: destId,
                    tags: tagIds,
                },
                sorting: {
                    sort: 'TRAVELER_RATING',
                    order: 'DESCENDING',
                },
                pagination: {
                    start: 1,
                    count: 30,
                },
                currency: 'USD',
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Viator fetchToursByDestination error (destId=${destId}):`, text);
            return [];
        }

        const data = await response.json();
        return data.products || [];
    }
}
