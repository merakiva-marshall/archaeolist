'use client';

import { ProcessedFeatures } from '../types/site';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-lg border p-3",
        "transition-all duration-200",
        "hover:shadow-md hover:border-accent"
      )}
      style={{ 
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text
      }}
    >
      <h3 className="text-sm font-medium mb-2">{category}</h3>
      <div className="flex flex-wrap gap-1">
        {features.map((feature) => (
          <motion.span
            key={feature}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "text-xs rounded-sm px-1.5 py-0.5",
              "transition-all duration-200",
              "hover:shadow-sm"
            )}
            style={{
              backgroundColor: colors.border,
              color: colors.text
            }}
          >
            {feature}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

interface SiteFeaturesProps {
  features?: ProcessedFeatures;
  siteId: string;
}

export default function SiteFeatures({ features = {}, siteId }: SiteFeaturesProps) {
  if (!features || Object.keys(features).length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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