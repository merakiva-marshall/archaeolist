'use client';

import { useState } from 'react';
import { Timeline } from '@/types/site';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { parseDateString, type ParsedDate } from '@/lib/dateUtils';

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
  const displayDate = Array.isArray(date) && date.length > 0 
    ? date.join(', ')
    : Array.isArray(century) && century.length > 0 
      ? century[0]
      : '';

  return (
    <div className={cn(
      "flex w-full relative",
      isEven ? 'md:justify-start' : 'md:justify-end'
    )}>
      {/* Mobile timeline line */}
      <div className="md:hidden absolute w-0.5 z-0 top-0 bottom-0" style={{ left: '15%' }}>
        {!isLast && <div className="absolute left-0 top-8 w-0.5 h-full bg-blue-300" />}
      </div>

      <div className={cn(
        "relative z-10 w-[85%] md:w-[45%] group bg-background",
        "transition-all duration-200"
      )}>
        {/* Desktop horizontal connector line */}
        <div className={cn(
          "absolute top-8 w-4 h-[1px] bg-blue-300 transform -translate-y-1/2",
          isEven ? '-right-4' : '-left-4',
          "hidden md:block"
        )} />

        <motion.div
          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "rounded-lg border p-3",
            "transition-all duration-200",
            "hover:shadow-md hover:border-accent"
          )}
        >
          <button
            onClick={onToggle}
            className="w-full flex justify-between items-start text-left"
          >
            <div>
              <h3 className="font-medium text-sm text-primary">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {displayDate}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-full p-1 transition-colors duration-200",
                isExpanded ? "bg-secondary" : "bg-secondary/50",
                "hover:bg-secondary"
              )}
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-colors duration-200",
                isExpanded ? "text-primary" : "text-muted-foreground"
              )} />
            </motion.div>
          </button>

          {isExpanded && description.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-xs text-muted-foreground"
            >
              {description.map((paragraph, i) => (
                <motion.p 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="mb-3 last:mb-0"
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface TimelineItemWithDate {
  parsedDate: ParsedDate;
  item: {
    title: string;
    date: string[];
    century: string[];
    description: string[];
  };
}

interface TimelineProps {
  timeline: Timeline;
}

export default function SiteTimeline({ timeline }: TimelineProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  if (!timeline || Object.keys(timeline).length === 0) {
    return null;
  }

  // Sort periods chronologically and process timeline items
  const timelineItems = Object.entries(timeline)
    .map(([title, item]) => {
      const dates = Array.isArray(item.date) ? item.date : [];
      const centuries = Array.isArray(item.century) ? item.century : [];
      // Use the first available date or century for sorting
      const dateStr = dates[0] || centuries[0] || '';
      return {
        parsedDate: parseDateString(dateStr),
        item: { 
          title,
          date: item.date,
          century: item.century,
          description: item.description
        }
      } as TimelineItemWithDate;
    })
    .sort((a, b) => a.parsedDate.year - b.parsedDate.year)
    .map(({ item }) => item);

  return (
    <div className="relative">
      <div className="relative">
        {/* Desktop center line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-4 w-[2px] bg-blue-300 transform -translate-x-1/2 rounded-full" />

        <div className="relative space-y-12">
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={item.title}
              title={item.title}
              date={item.date}
              century={item.century}
              description={item.description}
              index={index}
              isLast={index === timelineItems.length - 1}
              isExpanded={selectedPeriod === item.title}
              onToggle={() => setSelectedPeriod(selectedPeriod === item.title ? null : item.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}