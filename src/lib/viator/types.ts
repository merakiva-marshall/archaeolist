export interface ViatorTour {
    id: string;
    site_id: string;
    tour_id: string;
    title: string;
    description: string | null;
    price: number | null;
    currency: string | null;
    url: string | null;
    image_url: string | null;
    rating: number | null;
    review_count: number | null;
    last_updated: string;
}

export interface ViatorDestination {
    destinationId: number;
    name: string;
    type: string;
    parentDestinationId: number;
    lookupId: string;
    destinationUrl: string;
    defaultCurrencyCode: string;
    timeZone: string;
    iataCodes: string[];
    countryCallingCode: string;
    languages: string[];
    center?: {
        latitude: number;
        longitude: number;
    };
}

export interface ViatorDestinationsResponse {
    destinations: ViatorDestination[];
    totalCount: number;
}

export interface ViatorProduct {
    productCode: string;
    title: string;
    description: string | null;
    pricing?: {
        summary?: {
            fromPrice?: number;
        };
        currency?: string;
    };
    productUrl: string;
    images?: {
        variants?: {
            height: number;
            width: number;
            url: string;
        }[];
    }[];
    reviews?: {
        sources?: {
            averageRating?: number;
        }[];
        totalReviews?: number;
    };
}
