// src/components/SiteTimeline.tsx

'use client';

import { useState } from 'react';
import { Timeline } from '../types/site';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { logger } from '../lib/logger';
import { parseDateString, compareDates, type ParsedDate } from '../lib/dateUtils';

interface TimelineItemProps {
  title: string;
  date: string[];
  century: string[];
  description: string[];
  index: number;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function TimelineItem({ 
  title, 
  date = [],
  century = [],
  description = [], 
  index,
  isLast,
  isExpanded,
  onToggle 
}: TimelineItemProps) {
  const isEven = index % 2 === 0;

  // Format the date display
  const displayDate = date.length > 0 
    ? date.join(', ')
    : century.length > 0 
      ? century[0]
      : '';

  return (
    <div className={`
      flex w-full relative
      ${isEven ? 'md:justify-start' : 'md:justify-end'}
    `}>
      {/* Mobile timeline line container */}
      <div className="md:hidden absolute w-0.5 z-0 top-0 bottom-0" style={{ left: '15%' }}>
        {!isLast && <div className="absolute left-0 top-8 w-0.5 h-full bg-blue-300" />}
      </div>

      <div className={`
        relative bg-white rounded-lg shadow-sm border mb-6 md:mb-4
        transition-all duration-200 hover:shadow-md cursor-pointer
        md:w-[calc(50%-1rem)] w-[calc(100%-2rem)]
        mx-4 md:mx-0
        z-10
        ${isExpanded ? 'shadow-md' : ''}
      `}
        onClick={onToggle}
      >
        {/* Desktop-only horizontal connector line */}
        <div className={`
          absolute top-8 w-4 h-[1px] bg-blue-300
          transform -translate-y-1/2
          ${isEven ? '-right-4' : '-left-4'}
          hidden md:block
        `} />
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              {displayDate && (
                <p className="text-sm text-gray-600 mt-1">
                  {displayDate}
                </p>
              )}
            </div>
            {description.length > 0 && (
              isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500 mt-1" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 mt-1" />
              )
            )}
          </div>
          
          {isExpanded && description.length > 0 && (
            <div className="mt-3 text-sm text-gray-700">
              {description.map((desc, i) => (
                <p key={i} className="mt-1">{desc}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SiteTimelineProps {
  timeline: Timeline;
}

interface TimelineItemWithDate extends TimelineItemProps {
  parsedDate: ParsedDate;
}

export default function SiteTimeline({ timeline }: SiteTimelineProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  try {
    // Transform and sort timeline entries
    const timelineItems = Object.entries(timeline || {})
      .map(([title, data]) => {
        if (!data) {
          logger.warn(`Invalid timeline data for title: ${title}`);
          return null;
        }

        // Parse the primary date (from date array or century array)
        const parsedDate = data.date && data.date.length > 0
          ? parseDateString(data.date[0])
          : data.century && data.century.length > 0
            ? parseDateString(data.century[0])
            : { type: 'unknown' as const, year: 0, original: '' };

        return {
          title,
          ...data,
          date: data.date || [],
          century: data.century || [],
          description: data.description || [],
          parsedDate
        };
      })
      .filter((item): item is TimelineItemWithDate => item !== null)
      .sort((a, b) => compareDates(a.parsedDate, b.parsedDate));

    if (timelineItems.length === 0) {
      return null;
    }

    return (
      <div className="relative">
        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-blue-300 transform -translate-x-1/2 rounded-full" />

        <div className="space-y-0">
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={item.title}
              {...item}
              index={index}
              isLast={index === timelineItems.length - 1}
              isExpanded={expandedItem === item.title}
              onToggle={() => setExpandedItem(expandedItem === item.title ? null : item.title)}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    logger.error(error as Error, {
      component: 'SiteTimeline',
      timeline: JSON.stringify(timeline)
    });
    return null;
  }
}