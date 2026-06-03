// src/components/MapFilterBar.tsx
'use client'

import { useMemo } from 'react'
import { MapSite } from '../types/site'
import { useSiteFilters } from '../hooks/useSiteFilters'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface MapFilterBarProps {
  sites: MapSite[];
  /** 'overlay' floats over the map (desktop); 'below' is a full-width bar under the map. */
  variant?: 'overlay' | 'below';
}

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  width?: string;
}

function MultiSelect({ label, options, selected, onToggle, width = 'w-[180px]' }: MultiSelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('h-9 justify-between bg-white/95 backdrop-blur', width)}
        >
          {selected.length > 0 ? `${label} (${selected.length})` : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup className="max-h-[280px] overflow-y-auto">
              {options.map((option) => (
                <CommandItem key={option} value={option} onSelect={() => onToggle(option)}>
                  <Check className={cn('mr-2 h-4 w-4', selected.includes(option) ? 'opacity-100' : 'opacity-0')} />
                  <span className="flex-1 truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function MapFilterBar({ sites, variant = 'overlay' }: MapFilterBarProps) {
  const { filters, toggleInList, setUnesco, clearAll, activeCount } = useSiteFilters()

  const { countryOptions, periodOptions, featureOptions } = useMemo(() => {
    const countries = new Set<string>()
    const periods = new Set<string>()
    const features = new Set<string>()
    for (const site of sites) {
      if (site.country) countries.add(site.country)
      site.periods.forEach((p) => periods.add(p))
      site.features.forEach((f) => features.add(f))
    }
    const sortAlpha = (a: string, b: string) => a.localeCompare(b)
    return {
      countryOptions: Array.from(countries).sort(sortAlpha),
      periodOptions: Array.from(periods).sort(sortAlpha),
      featureOptions: Array.from(features).sort(sortAlpha),
    }
  }, [sites])

  const containerClass = variant === 'overlay'
    ? 'absolute top-3 left-3 right-3 sm:right-auto z-[60] rounded-xl bg-white/80 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-md'
    : 'w-full border-t border-gray-200 bg-white p-3'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', containerClass)}>
      <MultiSelect
        label="Country"
        options={countryOptions}
        selected={filters.countries}
        onToggle={(v) => toggleInList('countries', v)}
      />
      <MultiSelect
        label="Period"
        options={periodOptions}
        selected={filters.periods}
        onToggle={(v) => toggleInList('periods', v)}
      />
      <MultiSelect
        label="Features"
        options={featureOptions}
        selected={filters.features}
        onToggle={(v) => toggleInList('features', v)}
        width="w-[160px]"
      />

      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-white/95 px-3 text-sm font-medium">
        <Checkbox
          checked={filters.unesco}
          onCheckedChange={(c) => setUnesco(c as boolean)}
        />
        UNESCO
      </label>

      {activeCount > 0 && (
        <Button
          variant="default"
          onClick={clearAll}
          className="h-9 gap-1 border-0 bg-transparent text-gray-600 shadow-none hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-3.5 w-3.5" />
          Clear
          <Badge variant="secondary" className="ml-1">{activeCount}</Badge>
        </Button>
      )}
    </div>
  )
}
