// src/types/site.ts

export interface SiteImage {
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
  contentType: string;
}

export interface Site {
  id: string;
  name: string;
  description: string;
  location: [number, number];
  address: string | null;
  country: string;
  country_slug: string;
  slug: string;
  period: string;
  features: string;
  images?: SiteImage[] | null;
}