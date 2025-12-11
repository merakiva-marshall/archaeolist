'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Site } from '../types/site';
import SiteGrid from './SiteGrid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, Globe, Award, Check, ChevronsUpDown, X } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '../lib/utils';
import lookup from 'country-code-lookup';
import { Card, CardContent } from './ui/card';

interface UnescoSitesClientProps {
    initialSites: Site[];
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
        // Handle edge cases manually or try lookup
        // Some country names in DB might differ from standard lookup
        let searchName = countryName;
        if (searchName.toLowerCase() === 'the czech republic') searchName = 'Czech Republic';
        if (searchName.toLowerCase() === 'the united kingdom') searchName = 'United Kingdom';
        // Add more if needed

        const found = lookup.byCountry(searchName) || lookup.byCountry(cleanCountryName(countryName));
        if (found) {
            // Convert ISO code to emoji
            return found.iso2.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
        }
        return null;
    } catch {
        return null;
    }
};

export default function UnescoSitesClient({ initialSites }: UnescoSitesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    // Initialize selected countries from URL
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

    useEffect(() => {
        const countriesParam = searchParams.get('countries');
        if (countriesParam) {
            setSelectedCountries(countriesParam.split(','));
        } else {
            setSelectedCountries([]);
        }
    }, [searchParams]);

    // Update URL when selection changes
    const updateUrl = (newSelection: string[]) => {
        const params = new URLSearchParams(searchParams);
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

    // Extract unique countries
    const countries = useMemo(() => {
        const uniqueCountries = new Set(initialSites.map(site => site.country).filter(Boolean));
        return Array.from(uniqueCountries)
            .map(country => ({
                name: country!,
                cleanName: cleanCountryName(country!),
                emoji: getCountryEmoji(country!)
            }))
            .filter(c => c.emoji !== null) // Filter out if no emoji found
            .sort((a, b) => a.cleanName.localeCompare(b.cleanName));
    }, [initialSites]);

    // Filter sites
    const filteredSites = useMemo(() => {
        if (selectedCountries.length === 0) return initialSites;

        // Also re-filter based on the emoji list effectively? 
        // User said "if there is no country emoji, do not include the country in the list".
        // This implies we shouldn't show sites for countries without emojis either? 
        // Or just don't show them in the *filter*? 
        // I'll stick to not showing them in the *filter list*. 
        // If a user can't filter by them, valid sites might still be shown in "All".
        // But for consistency, let's just assume valid countries have emojis.

        return initialSites.filter(site => site.country && selectedCountries.includes(site.country));
    }, [initialSites, selectedCountries]);

    // Find a hero image, prioritizing Giza
    const heroImage = useMemo(() => {
        const gizaSite = initialSites.find(s => s.name.toLowerCase().includes('giza') && s.images && s.images.length > 0);
        if (gizaSite) return gizaSite.images?.[0]?.url;

        // Fallback
        const sitesWithImages = initialSites.filter(site => site.images && site.images.length > 0);
        if (sitesWithImages.length > 5) {
            return sitesWithImages[5].images?.[0]?.url || null;
        }
        return sitesWithImages[0]?.images?.[0]?.url || null;
    }, [initialSites]);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">

                    {/* Desktop Header */}
                    <div className="mb-8 hidden lg:block">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-8">
                            <h1 className="text-4xl font-bold mb-2">UNESCO World Heritage Sites</h1>
                            <p className="text-xl text-blue-100">Explore the world&apos;s most significant archaeological treasures.</p>
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="mb-8 lg:hidden">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
                            <h1 className="text-3xl font-bold mb-2">UNESCO World Heritage</h1>
                            <p className="text-blue-100">Preserving our shared human history.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column: Info */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="lg:col-span-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                                {/* Info Card */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                    {heroImage && (
                                        <div className="relative h-48 w-full">
                                            <Image
                                                src={heroImage}
                                                alt="Pyramids of Giza"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                <div className="text-white">
                                                    <div className="flex items-center space-x-2 text-sm font-medium opacity-90 mb-1">
                                                        <Globe className="h-4 w-4" />
                                                        <span>World Heritage</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 space-y-4">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                            <Building2 className="mr-2 h-6 w-6 text-blue-600" />
                                            About UNESCO
                                        </h2>
                                        <div className="prose prose-blue prose-sm text-gray-600">
                                            <p>
                                                The United Nations Educational, Scientific and Cultural Organization (<a href="https://whc.unesco.org/" target="_blank" rel="noopener noreferrer">UNESCO</a>) World Heritage Sites represent the most significant natural and cultural treasures of our planet. These sites are judged to contain &quot;cultural and natural heritage around the world considered to be of outstanding value to humanity.&quot;
                                            </p>

                                            <h4 className="text-gray-900 font-semibold text-base mt-6 mb-2">How does a place become a World Heritage Site?</h4>
                                            <p>
                                                The process begins with a country (State Party) creating a Tentative List of important sites. From this list, they can select a site to prepare a comprehensive Nomination File. This file is evaluated by independent advisory bodies: ICOMOS (for cultural sites) and IUCN (for natural sites). Finally, the World Heritage Committee meets annually to make the final decision on inscription.
                                            </p>

                                            <h4 className="text-gray-900 font-semibold text-base mt-6 mb-2">What are the different types of sites?</h4>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>Cultural:</strong> Man-made sites like monuments, cities, or buildings (e.g., Taj Mahal, Historic Centre of Rome).</li>
                                                <li><strong>Natural:</strong> Physical or biological formations with exceptional beauty or scientific value (e.g., Great Barrier Reef, Yellowstone).</li>
                                                <li><strong>Mixed:</strong> Sites that satisfy both cultural and natural criteria (e.g., Machu Picchu).</li>
                                            </ul>

                                            <h4 className="text-gray-900 font-semibold text-base mt-6 mb-2">What threats do these sites face?</h4>
                                            <p>
                                                Many sites are in danger due to climate change (rising sea levels, extreme weather), overtourism causing physical degradation, armed conflict and war, as well as urbanization, poaching, and neglect. UNESCO maintains a <a href="https://whc.unesco.org/en/danger/" target="_blank" rel="noopener noreferrer">List of World Heritage in Danger</a> to rally international support for these threatened treasures.
                                            </p>

                                            <h4 className="text-gray-900 font-semibold text-base mt-6 mb-2">Famous World Heritage Sites</h4>
                                            <p>
                                                Some of the most recognizable sites include the <Link href="/site/giza-pyramid-complex" className="font-bold underline">Pyramids of Giza</Link>, <Link href="/site/angkor" className="font-bold underline">Angkor Wat</Link>, <Link href="/site/pompeii" className="font-bold underline">Pompeii</Link>, and <Link href="/site/chichen-itza" className="font-bold underline">Chichen Itza</Link>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Filter, Stats, List */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Filter and Stats Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                                {/* Filter Card */}
                                <Card className="lg:col-span-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Filter by Country</h3>
                                            {selectedCountries.length > 0 && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Clear all
                                                </button>
                                            )}
                                        </div>

                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedCountries.length > 0
                                                        ? `${selectedCountries.length} selected`
                                                        : "Select countries..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search country..." />
                                                    <CommandList>
                                                        <CommandEmpty>No country found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {countries.map((country) => (
                                                                <CommandItem
                                                                    key={country.name}
                                                                    value={country.name.toLowerCase()}
                                                                    keywords={[country.name]}
                                                                    onSelect={() => {
                                                                        toggleCountry(country.name);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedCountries.includes(country.name)
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <span className="flex-1">
                                                                        {country.emoji} {country.cleanName}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 ml-2">
                                                                        {initialSites.filter(s => s.country === country.name).length}
                                                                    </span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>

                                        {/* Active Filters Tags */}
                                        {selectedCountries.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {selectedCountries.map(country => {
                                                    const countryData = countries.find(c => c.name === country);
                                                    return (
                                                        <Badge key={country} variant="secondary" className="pl-2 pr-1 py-1">
                                                            {countryData?.emoji} {cleanCountryName(country)}
                                                            <button
                                                                onClick={() => removeCountry(country)}
                                                                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Stats Card (Matching Country Page style) */}
                                <Card className="lg:col-span-1">
                                    <CardContent className="pt-6 h-full flex items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Award className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{filteredSites.length}</div>
                                                <div className="text-sm text-gray-600">UNESCO World Heritage Sites</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <SiteGrid
                                key={selectedCountries.join(',')}
                                initialSites={filteredSites}
                                showCountryContext={true}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
