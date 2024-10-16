// src/app/types/site.ts

export interface Site {
    id: string;
    name: string;
    description: string;
    location: [number, number];
    address: string;
    period: string[] | string | null;
    features: string[] | string | null;
    country: string;
    slug: string;
  }