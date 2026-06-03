// src/types/site.ts

export interface SiteImage {
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
  contentType: string;
}

export interface TimelineItem {
  date: string[];
  century: string[];
  description: string[];
}

export interface Timeline {
  [key: string]: TimelineItem;
}

export interface ProcessedFeatures {
  [category: string]: string[];
}

export interface ProcessedPeriods {
  [period: string]: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQData {
  faqs: FAQ[];
}

// Slim shape used to render map markers + drive client-side filtering.
// Intentionally omits heavy columns (description, images, etc.) — the full
// record is fetched on demand when a site is selected.
export interface MapSite {
  id: string;
  name: string;
  slug: string;
  country: string;
  country_slug: string;
  location: [number, number];
  is_unesco: boolean;
  periods: string[];
  features: string[];
}

// Active map filters, mirrored to/from the URL query params shared with the
// All Sites page.
export interface MapFilters {
  countries: string[];
  periods: string[];
  features: string[];
  unesco: boolean;
}

export const EMPTY_MAP_FILTERS: MapFilters = {
  countries: [],
  periods: [],
  features: [],
  unesco: false,
};

export interface Site {
  // Required properties
  id: string;
  name: string;
  description: string;
  location: [number, number];
  country: string;
  country_slug: string;
  slug: string;

  // Optional properties
  address?: string | null;
  images?: SiteImage[] | null;
  wikipedia_url?: string;
  is_unesco?: boolean;
  short_description?: string;
  processed_features?: ProcessedFeatures;
  processed_periods?: ProcessedPeriods;
  period?: string[];
  features?: string[] | null;
  timeline?: Timeline;
  featured?: boolean;
  featured_score?: number;
  archaeological_site_yn?: boolean;
  faqs?: FAQData | FAQ[];  // DB returns a plain array; FAQData shape is legacy
  created_at?: string;
  updated_at?: string;
}