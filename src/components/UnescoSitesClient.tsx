'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Site } from '../types/site';
import SiteGrid from './SiteGrid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Globe, Award, Check, ChevronsUpDown, X } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '../lib/utils';
import lookup from 'country-code-lookup';
import { SiteMetadata } from '../lib/sites';

const CountryMap = dynamic(() => import('./CountryMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[320px] bg-surface-container animate-pulse rounded-2xl" />,
});

interface UnescoSitesClientProps {
    initialSites: Site[];
    totalCount: number;
    metadata: SiteMetadata;
    currentPage: number;
    itemsPerPage: number;
    heroImage?: string | null;
    allMapSites?: Site[];
    content: {
        title: string;
        description: string;
    };
}

// Helper to clean country names
const cleanCountryName = (name: string) => {
    return name.replace(/^the\s+/i, '');
};

// Helper to get emoji flag
const getCountryEmoji = (countryName: string) => {
    try {
        let searchName = countryName;
        if (searchName.toLowerCase() === 'the czech republic') searchName = 'Czech Republic';
        if (searchName.toLowerCase() === 'the united kingdom') searchName = 'United Kingdom';

        const found = lookup.byCountry(searchName) || lookup.byCountry(cleanCountryName(countryName));
        if (found) {
            return found.iso2.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
        }
        return null;
    } catch {
        return null;
    }
};

export default function UnescoSitesClient({
    initialSites,
    totalCount,
    metadata,
    currentPage,
    itemsPerPage,
    heroImage,
    allMapSites,
}: UnescoSitesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    // Initialize selected countries from URL
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

    useEffect(() => {
        const countriesParam = searchParams.get('countries');
        setSelectedCountries(countriesParam ? countriesParam.split(',') : []);
    }, [searchParams]);

    // Update URL helper
    const updateUrl = (newSelection: string[]) => {
        const params = new URLSearchParams(searchParams);

        // Reset page on filter change
        params.delete('page');

        if (newSelection.length > 0) {
            params.set('countries', newSelection.join(','));
        } else {
            params.delete('countries');
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const toggleCountry = (country: string) => {
        const newSelection = selectedCountries.includes(country)
            ? selectedCountries.filter(c => c !== country)
            : [...selectedCountries, country];

        setSelectedCountries(newSelection);
        updateUrl(newSelection);
    };

    const removeCountry = (country: string) => {
        const newSelection = selectedCountries.filter(c => c !== country);
        setSelectedCountries(newSelection);
        updateUrl(newSelection);
    };

    const clearFilters = () => {
        setSelectedCountries([]);
        updateUrl([]);
    };

    // Calculate Pages
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const getPageLink = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `?${params.toString()}`;
    };

    // Prepare country options from metadata + emojis
    const countryOptions = useMemo(() => {
        // Use metadata list instead of deriving from loaded sites
        return metadata.countries.map(c => ({
            name: c.name,
            cleanName: cleanCountryName(c.name),
            emoji: getCountryEmoji(c.name)
        })).sort((a, b) => a.cleanName.localeCompare(b.cleanName));
    }, [metadata.countries]);


    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-surface">

                {/* Header */}
                <div className="bg-surface border-b border-outline-variant px-8 pt-10 pb-8">
                    <div className="max-w-7xl mx-auto">
                        <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">World Heritage</span>
                        <h1 className="text-5xl md:text-6xl font-black text-primary-brand font-headline tracking-tighter leading-[0.95] mt-1">
                            UNESCO Archaeological Sites
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column: Info Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
                                <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
                                    {heroImage && (
                                        <div className="relative h-48 w-full">
                                            <Image
                                                src={heroImage}
                                                alt="UNESCO World Heritage"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                <div className="flex items-center gap-2 text-white text-xs font-label font-semibold uppercase tracking-widest opacity-90">
                                                    <Globe className="h-3.5 w-3.5" />
                                                    <span>World Heritage</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 space-y-4">
                                        <h2 className="text-xl font-headline font-black text-primary-brand tracking-tight">About UNESCO</h2>
                                        <div className="space-y-4 text-sm font-body text-on-surface leading-loose">
                                            <p>
                                                The United Nations Educational, Scientific and Cultural Organization (<a href="https://whc.unesco.org/" target="_blank" rel="noopener noreferrer" className="text-primary-brand hover:underline">UNESCO</a>) World Heritage Sites represent the most significant natural and cultural treasures of our planet. These sites are judged to contain &quot;cultural and natural heritage around the world considered to be of outstanding value to humanity.&quot;
                                            </p>

                                            <h4 className="text-on-surface font-headline font-bold text-sm mt-4">How does a place become a World Heritage Site?</h4>
                                            <p>
                                                The process begins with a country (State Party) creating a Tentative List of important sites. From this list, they can select a site to prepare a comprehensive Nomination File. This file is evaluated by independent advisory bodies: ICOMOS (for cultural sites) and IUCN (for natural sites). Finally, the World Heritage Committee meets annually to make the final decision on inscription.
                                            </p>

                                            <h4 className="text-on-surface font-headline font-bold text-sm mt-4">Types of sites</h4>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>Cultural:</strong> Man-made sites like monuments, cities, or buildings (e.g., Taj Mahal, Historic Centre of Rome).</li>
                                                <li><strong>Natural:</strong> Physical or biological formations with exceptional beauty or scientific value (e.g., Great Barrier Reef, Yellowstone).</li>
                                                <li><strong>Mixed:</strong> Sites that satisfy both cultural and natural criteria (e.g., Machu Picchu).</li>
                                            </ul>

                                            <h4 className="text-on-surface font-headline font-bold text-sm mt-4">Threats</h4>
                                            <p>
                                                Many sites are in danger due to climate change, overtourism, armed conflict, and neglect. UNESCO maintains a <a href="https://whc.unesco.org/en/danger/" target="_blank" rel="noopener noreferrer" className="text-primary-brand hover:underline">List of World Heritage in Danger</a> to rally international support.
                                            </p>

                                            <h4 className="text-on-surface font-headline font-bold text-sm mt-4">Famous sites</h4>
                                            <p>
                                                Some of the most recognizable include the <Link href="/sites/egypt/giza-pyramid-complex" className="text-primary-brand hover:underline font-semibold">Pyramids of Giza</Link>, <Link href="/sites/cambodia/angkor" className="text-primary-brand hover:underline font-semibold">Angkor Wat</Link>, <Link href="/sites/italy/pompeii" className="text-primary-brand hover:underline font-semibold">Pompeii</Link>, and <Link href="/sites/mexico/chichen-itza" className="text-primary-brand hover:underline font-semibold">Chichen Itza</Link>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Map, Filter, Stats, Grid */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Map — uses all UNESCO sites for full coverage */}
                            <CountryMap sites={allMapSites ?? initialSites} className="w-full h-[320px]" randomStart />

                            {/* Filter + Stats Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                                {/* Filter */}
                                <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-headline font-black text-primary-brand tracking-tight">Filter by Country</h3>
                                        {selectedCountries.length > 0 && (
                                            <button onClick={clearFilters} className="text-xs font-label font-semibold text-primary-brand hover:text-primary-container">
                                                Clear all
                                            </button>
                                        )}
                                    </div>

                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-label">
                                                {selectedCountries.length > 0 ? `${selectedCountries.length} selected` : "Select countries..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search country..." />
                                                <CommandList>
                                                    <CommandEmpty>No country found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                        {countryOptions.map((country) => (
                                                            <CommandItem
                                                                key={country.name}
                                                                value={country.name.toLowerCase()}
                                                                keywords={[country.name]}
                                                                onSelect={() => { toggleCountry(country.name); setOpen(false); }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", selectedCountries.includes(country.name) ? "opacity-100" : "opacity-0")} />
                                                                <span className="flex-1 truncate">{country.emoji} {country.cleanName}</span>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {selectedCountries.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {selectedCountries.map(country => {
                                                const cd = countryOptions.find(c => c.name === country) || { emoji: '🏳️', cleanName: cleanCountryName(country) };
                                                return (
                                                    <Badge key={country} variant="secondary" className="pl-2 pr-1 py-1 font-label">
                                                        {cd.emoji} {cd.cleanName}
                                                        <button onClick={() => removeCountry(country)} className="ml-1 hover:bg-surface-container rounded-full p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="lg:col-span-1 bg-surface-container-lowest rounded-2xl shadow-sm p-5 flex items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-surface-container rounded-lg text-primary-brand">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-headline font-black text-primary-brand leading-none">{totalCount}</div>
                                            <div className="text-xs font-label text-on-surface-variant mt-0.5">UNESCO Listed</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SiteGrid initialSites={initialSites} showCountryContext={true} manualPagination={true} />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-8">
                                    <Button
                                        variant="outline"
                                        disabled={currentPage <= 1}
                                        onClick={() => router.push(getPageLink(currentPage - 1), { scroll: true })}
                                        className="font-label"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-label text-on-surface-variant">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => router.push(getPageLink(currentPage + 1), { scroll: true })}
                                        className="font-label"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
