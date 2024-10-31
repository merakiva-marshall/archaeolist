// src/types/supabase.ts

interface SiteRow {
    id: string;
    name: string;
    description: string;
    country: string;
    country_slug: string;
    slug: string;
    is_unesco: boolean;
    address: string | null;
    images: unknown | null;
    wikipedia_url: string | null;
    short_description: string | null;
    processed_features: Record<string, string[]> | null;
    processed_periods: Record<string, string[]> | null;
    timeline: Record<string, unknown> | null;
    archaeological_site_yn: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    location: {
      coordinates: [number, number];
    };
  }
  
  interface InsertSite {
    name: string;
    description: string;
    country: string;
    country_slug: string;
    slug: string;
    is_unesco?: boolean;
    address?: string | null;
    images?: unknown | null;
    wikipedia_url?: string | null;
    short_description?: string | null;
    processed_features?: Record<string, string[]> | null;
    processed_periods?: Record<string, string[]> | null;
    timeline?: Record<string, unknown> | null;
    archaeological_site_yn?: boolean;
    location: {
      coordinates: [number, number];
    };
  }
  
  interface UpdateSite {
    name?: string;
    description?: string;
    country?: string;
    country_slug?: string;
    slug?: string;
    is_unesco?: boolean;
    address?: string | null;
    images?: unknown | null;
    wikipedia_url?: string | null;
    short_description?: string | null;
    processed_features?: Record<string, string[]> | null;
    processed_periods?: Record<string, string[]> | null;
    timeline?: Record<string, unknown> | null;
    archaeological_site_yn?: boolean;
    location?: {
      coordinates: [number, number];
    };
    updated_at?: string;
  }
  
  export interface Database {
    public: {
      Tables: {
        sites: {
          Row: SiteRow;
          Insert: InsertSite;
          Update: UpdateSite;
        };
      };
    };
  }