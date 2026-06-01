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
  variant?: 'default' | 'redesign';
}

// Icon mapping for redesign variant
const CATEGORY_ICONS: Record<string, { icon: string; iconBg: string; iconText: string }> = {
  'Storage & Production': { icon: 'warehouse', iconBg: 'bg-amber-100', iconText: 'text-amber-700' },
  'Defensive': { icon: 'shield', iconBg: 'bg-rose-100', iconText: 'text-rose-700' },
  'Burial & Funerary': { icon: 'church', iconBg: 'bg-violet-100', iconText: 'text-violet-700' },
  'Religious & Ceremonial': { icon: 'temple_hindu', iconBg: 'bg-blue-100', iconText: 'text-blue-700' },
  'Architecture': { icon: 'domain', iconBg: 'bg-emerald-100', iconText: 'text-emerald-700' },
  'Cultural': { icon: 'theater_comedy', iconBg: 'bg-cyan-100', iconText: 'text-cyan-700' },
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-900', border: 'border-violet-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-900', border: 'border-cyan-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-900', border: 'border-gray-200' },
};

export default function SiteFeatures({ features = {}, siteId, variant = 'default' }: SiteFeaturesProps) {
  if (!features || Object.keys(features).length === 0) {
    return null;
  }

  // Redesign variant with Material Symbols icons and colored tag pills
  if (variant === 'redesign') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(features || {})
          .filter(([, categoryFeatures]) => Array.isArray(categoryFeatures))
          .map(([category, categoryFeatures]) => {
            const iconConfig = CATEGORY_ICONS[category] || { icon: 'category', iconBg: 'bg-gray-100', iconText: 'text-gray-700' };
            const colorKey = category === 'Storage & Production' ? 'amber' :
                            category === 'Defensive' ? 'rose' :
                            category === 'Burial & Funerary' ? 'violet' :
                            category === 'Religious & Ceremonial' ? 'blue' :
                            category === 'Architecture' ? 'emerald' :
                            category === 'Cultural' ? 'cyan' : 'gray';
            const colorClasses = COLOR_CLASSES[colorKey];

            return (
              <motion.div
                key={category}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "bg-[#ffffff] rounded-xl border border-[#c3c6d6]/20 p-4",
                  "transition-all duration-200 hover:shadow-lg hover:border-[#003b93]/30"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    iconConfig.iconBg
                  )}>
                    <span className={cn(
                      "material-symbols-outlined text-2xl",
                      iconConfig.iconText
                    )}>
                      {iconConfig.icon}
                    </span>
                  </div>
                  <h3 className="text-base font-label font-semibold text-[#1b1c1c] flex-1">
                    {category}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryFeatures.map((feature) => (
                    <motion.span
                      key={feature}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={cn(
                        "text-xs font-label rounded-full px-3 py-1.5 border",
                        colorClasses.bg,
                        colorClasses.text,
                        colorClasses.border,
                        "transition-all duration-200 hover:shadow-sm"
                      )}
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(features || {})
        .filter(([, categoryFeatures]) => Array.isArray(categoryFeatures))
        .map(([category, categoryFeatures]) => (
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