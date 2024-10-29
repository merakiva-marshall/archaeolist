// src/lib/dateUtils.ts

export type DateType = 'numerical' | 'century' | 'millennium' | 'range' | 'unknown';

export interface ParsedDate {
  type: DateType;
  year: number;
  original: string;
}

function determineEra(dateStr: string): 'BCE' | 'CE' {
  return dateStr.toLowerCase().includes('bce') ? 'BCE' : 'CE';
}

function extractYear(numberStr: string): number {
  return parseInt(numberStr.replace(/,/g, ''));
}

function convertCenturyToYear(century: number, era: 'BCE' | 'CE'): number {
  // Convert century to starting year
  // e.g., 1st century CE = year 0, 2nd century CE = year 100
  // 1st century BCE = year -100, 2nd century BCE = year -200
  if (era === 'CE') {
    return (century - 1) * 100;
  } else {
    return -(century * 100);
  }
}

function parseNumericalDate(dateStr: string): number {
  const cleanStr = dateStr.trim();
  
  // Handle "years ago" format
  if (cleanStr.toLowerCase().includes('years ago')) {
    const yearsAgo = extractYear(cleanStr);
    return -(new Date().getFullYear() - yearsAgo);
  }
  
  const era = determineEra(cleanStr);
  const numberMatch = cleanStr.match(/-?\d+/);
  
  if (!numberMatch) return 0;
  
  const year = extractYear(numberMatch[0]);
  return era === 'BCE' ? -year : year;
}

function parseCentury(centuryStr: string): number {
  const cleanStr = centuryStr.toLowerCase().trim();
  
  // Extract the century number
  const numberMatch = cleanStr.match(/(\d+)(st|nd|rd|th)/);
  if (!numberMatch) return 0;
  
  const century = parseInt(numberMatch[1]);
  const era = determineEra(cleanStr);
  
  return convertCenturyToYear(century, era);
}

function parseMillennium(millenniumStr: string): number {
  const cleanStr = millenniumStr.toLowerCase().trim();
  const numberMatch = cleanStr.match(/(\d+)(st|nd|rd|th)/);
  if (!numberMatch) return 0;
  
  const millennium = parseInt(numberMatch[1]);
  const era = determineEra(cleanStr);
  
  // Convert millennium to starting year
  return era === 'BCE' ? -(millennium * 1000) : (millennium - 1) * 1000;
}

export function parseDateString(dateStr: string): ParsedDate {
  if (!dateStr) {
    return { type: 'unknown', year: 0, original: dateStr };
  }

  const cleanStr = dateStr.toLowerCase().trim();

  // Handle year ranges (take the first/earlier date)
  if (cleanStr.includes('–') || cleanStr.includes('-')) {
    const [firstDate] = cleanStr.split(/–|-/).map(d => d.trim());
    return {
      type: 'range',
      year: parseNumericalDate(firstDate),
      original: dateStr
    };
  }

  // Handle millennium
  if (cleanStr.includes('millennium')) {
    return {
      type: 'millennium',
      year: parseMillennium(cleanStr),
      original: dateStr
    };
  }

  // Handle century
  if (cleanStr.includes('century')) {
    return {
      type: 'century',
      year: parseCentury(cleanStr),
      original: dateStr
    };
  }

  // Handle numerical dates
  if (cleanStr.match(/\d/)) {
    return {
      type: 'numerical',
      year: parseNumericalDate(cleanStr),
      original: dateStr
    };
  }

  return {
    type: 'unknown',
    year: 0,
    original: dateStr
  };
}

export function compareDates(a: ParsedDate, b: ParsedDate): number {
  // Sort by year (oldest first)
  return a.year - b.year;
}