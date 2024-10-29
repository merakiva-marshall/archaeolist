// src/components/SiteFeatures.tsx

'use client';

import { ProcessedFeatures } from '../types/site';
import { useMemo } from 'react';

// Generate unique colors based on siteId and category
function generateColors(siteId: string, category: string): { bg: string; text: string; border: string } {
    const hash = Array.from(siteId + category).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
  
    const h = hash % 360;
    const s = 30 + (hash % 20); // 30-50% saturation
    const l = 96 + (hash % 2); // 96-98% lightness for very light background
    
    return {
      bg: `hsl(${h}, ${s}%, ${l}%)`,
      text: `hsl(${h}, ${s}%, 25%)`,
      border: `hsl(${h}, ${s}%, ${l-10}%)`, // Darker for pills
    };
  }

  interface FeatureCardProps {
    category: string;
    features: string[];
    siteId: string;
  }

  function FeatureCard({ category, features, siteId }: FeatureCardProps) {
    const colors = useMemo(() => generateColors(siteId, category), [siteId, category]);

  return (
    <div 
      className="rounded-lg border p-3"
      style={{ 
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text
      }}
    >
      <h3 className="text-sm font-medium mb-2">{category}</h3>
      <div className="flex flex-wrap gap-1">
        {features.map((feature) => (
          <span
            key={feature}
            className="text-xs rounded-sm px-1.5 py-0.5"
            style={{
              backgroundColor: colors.border,
              color: colors.text
            }}
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

interface SiteFeaturesProps {
  features?: ProcessedFeatures;
  siteId: string;
}

export default function SiteFeatures({ features = {}, siteId }: SiteFeaturesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(features || {}).map(([category, categoryFeatures]) => (
        <FeatureCard
          key={category}
          category={category}
          features={categoryFeatures}
          siteId={siteId}
        />
      ))}
    </div>
  );
}