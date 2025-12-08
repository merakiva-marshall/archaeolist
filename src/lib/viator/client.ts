import { ViatorDestinationsResponse, ViatorDestination } from './types';

const VIATOR_BASE_URL = 'https://api.viator.com/partner';

export class ViatorClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async fetchAllDestinations(): Promise<ViatorDestination[]> {
        console.log('Fetching all Viator destinations...');
        const response = await fetch(`${VIATOR_BASE_URL}/destinations`, {
            method: 'GET',
            headers: {
                'exp-api-key': this.apiKey,
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US'
            }
        });

        if (!response.ok) {
            // Log the error body for debugging
            const text = await response.text();
            console.error('Viator API Error Body:', text);
            throw new Error(`Failed to fetch destinations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as ViatorDestinationsResponse;
        console.log(`Fetched ${data.totalCount} destinations`);
        return data.destinations;
    }

    async fetchToursForDestination(destId: string, siteName: string) {
        console.log(`Fetching tours for destination ${destId} (${siteName})...`);
        const response = await fetch(`${VIATOR_BASE_URL}/products/search`, {
            method: 'POST',
            headers: {
                'exp-api-key': this.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US'
            },
            body: JSON.stringify({
                filtering: {
                    text: siteName,
                    destination: destId
                },
                sorting: {
                    sort: "PRICE",
                    order: "DESCENDING"
                },
                pagination: {
                    start: 1,
                    count: 10
                },
                currency: "USD"
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Viator API Error Body:', text);
            throw new Error(`Failed to fetch tours: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.products || [];
    }
}
