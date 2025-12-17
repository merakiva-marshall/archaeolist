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
  archaeological_site_yn?: boolean;
  faqs?: FAQData;
  created_at?: string;
  updated_at?: string;
}