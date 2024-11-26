export interface References {
  /**  */
  id: string;
  /**  */
  page_ref: string| null;
  /**  */
  reference_name: string;
  /**  */
  site_id: string| null;
  /**  */
  url: string| null;
}



export interface SitesWithRefCount {
  /**  */
  address: string| null;
  /**  */
  country: string| null;
  /**  */
  created_at: any| null;
  /**  */
  description: string| null;
  /**  */
  features: string[]| null;
  /**  */
  id: string| null;
  /**  */
  images: Record<string, any>| null;
  /**  */
  location: any| null;
  /**  */
  metadata: Record<string, any>| null;
  /**  */
  name: string| null;
  /**  */
  period: string[]| null;
  /**  */
  reference_count: number| null;
  /**  */
  slug: string| null;
  /**  */
  updated_at: any| null;
  /**  */
  wikipedia_url: string| null;
}



export interface UnescoSites {
  /**  */
  area: string| null;
  /**  */
  buffer_zone: string| null;
  /**  */
  coordinates: string| null;
  /** Criteria under which the site was inscribed' */
  criteria: string| null;
  /**  */
  endangered: string| null;
  /**  */
  id: string;
  /** Year the site was inscribed on the World Heritage List */
  inscription: string| null;
  /**  */
  location: string| null;
  /** Unique identifier assigned by UNESCO */
  reference: string| null;
  /**  */
  site_id: string| null;
  /**  */
  type: string| null;
  /**  */
  unesco_data: Record<string, any>| null;
}



export interface Sites {
  /**  */
  address: string| null;
  /**  */
  archaeological_site_yn: boolean| null;
  /**  */
  country: string| null;
  /**  */
  country_slug: string| null;
  /**  */
  created_at: any| null;
  /**  */
  description: string| null;
  /**  */
  features: string[]| null;
  /**  */
  id: string;
  /**  */
  images: Record<string, any>| null;
  /** for "true" links to "unesco_sites" table */
  is_unesco: boolean| null;
  /**  */
  last_processed_at: any| null;
  /** PostGIS type */
  location: any;
  /**  */
  metadata: Record<string, any>| null;
  /**  */
  name: string;
  /**  */
  period: string[]| null;
  /**  */
  processed_features: Record<string, any>| null;
  /**  */
  processed_periods: Record<string, any>| null;
  /**  */
  short_description: string| null;
  /** main key */
  slug: string;
  /**  */
  timeline: Record<string, any>| null;
  /**  */
  updated_at: any| null;
  /**  */
  wikipedia_url: string| null;
}

