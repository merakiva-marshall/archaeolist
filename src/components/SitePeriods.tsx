// src/components/SitePeriods.tsx

'use client';

import { ProcessedPeriods } from '../types/site';
import { useState } from 'react';

const PERIOD_DEFINITIONS = {
  "Paleolithic": "3.3 million years ago – 10,000 BCE",
  "Mesolithic": "10,000 BCE – 8,000 BCE",
  "Neolithic": "8,000 BCE – 3,000 BCE",
  "Chalcolithic": "3,500 BCE – 2,500 BCE",
  "Bronze Age": "3,300 BCE – 1,200 BCE",
  "Iron Age": "1,200 BCE – 500 CE",
  "Classical Period": "500 BCE – 500 CE",
  "Post-Classical Period": "500 CE – 1500 CE",
  "Early Modern Period": "1500 CE – 1800 CE",
  "Industrial Period": "1800 CE – 1950 CE",
  "Contemporary Period": "1950 CE – Present"
};

const periods = Object.keys(PERIOD_DEFINITIONS);
const midpoint = Math.ceil(periods.length / 2);
const COLUMN_1 = periods.slice(0, midpoint);
const COLUMN_2 = periods.slice(midpoint);

interface TimelinePeriodMarkerProps {
  period: string;
  isPresent: boolean;
  isMobile?: boolean;
}

function PeriodMarker({ period, isPresent, isMobile = false }: TimelinePeriodMarkerProps) {
  if (isMobile) {
    return (
      <div className="flex items-center h-6">
        <div className="w-5 flex justify-center flex-shrink-0">
          <div className={`
            rounded-full transition-all duration-200
            ${isPresent
              ? 'w-2.5 h-2.5 bg-[#0077D4]'
              : 'w-1.5 h-1.5 bg-gray-200'
            }
          `} />
        </div>
        <span className={`
          transition-all duration-200 min-w-0 flex-1
          ${isPresent
            ? 'text-sm font-semibold text-gray-900'
            : 'text-sm text-gray-400'
          }
        `}>
          {period}
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center h-8">
      <div className="flex justify-center w-5">
        <div className={`
          transition-all duration-200
          rounded-md
          ${isPresent
            ? 'w-4 h-4 bg-[#0077D4]'
            : 'w-3.5 h-3.5 border-2 border-gray-200 bg-white'
          }
        `} />
      </div>
      <span className={`
        transition-all duration-200 whitespace-nowrap
        ${isPresent
          ? 'text-base font-medium text-gray-900'
          : 'text-sm text-gray-400'
        }
      `}>
        {period}
      </span>
    </div>
  );
}

interface SitePeriodsProps {
  periods?: ProcessedPeriods;
  isFloating?: boolean;
  headingLevel?: 'h2' | 'h3';
}

export default function SitePeriods({
  periods = {},
  isFloating = false,
  headingLevel = 'h2'
}: SitePeriodsProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const HeadingTag = headingLevel;


  return (
    <div>
      {/* Mobile view */}
      <div className="lg:hidden">
        <div className="rounded-lg border p-4">
          <HeadingTag className="text-2xl font-bold mb-4">Time Periods</HeadingTag>
          <div className="grid grid-cols-12 gap-x-2">
            <div className="col-span-5 space-y-1">
              {COLUMN_1.map((period) => (
                <div key={period}>
                  <h3 className="sr-only">{period}</h3>
                  <PeriodMarker
                    period={period}
                    isPresent={period in periods}
                    isMobile={true}
                  />
                </div>
              ))}
            </div>
            <div className="col-span-7 space-y-1">
              {COLUMN_2.map((period) => (
                <div key={period}>
                  <h3 className="sr-only">{period}</h3>
                  <PeriodMarker
                    period={period}
                    isPresent={period in periods}
                    isMobile={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
        <HeadingTag className={`
          font-bold mb-6 transition-all duration-300
          ${isFloating ? 'text-lg' : 'text-2xl'}
        `}>
          Time Periods
        </HeadingTag>
        <div className="space-y-1">
          {Object.keys(PERIOD_DEFINITIONS).map((period) => (
            <div
              key={period}
              onMouseEnter={(e) => {
                if (period in periods) {
                  setTooltip({
                    text: `${period}: ${PERIOD_DEFINITIONS[period as keyof typeof PERIOD_DEFINITIONS]}`,
                    x: e.clientX,
                    y: e.clientY
                  });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <h3 className="sr-only">{period}</h3>
              <PeriodMarker
                period={period}
                isPresent={period in periods}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white px-3 py-2 rounded-lg shadow-lg border text-sm whitespace-nowrap"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}