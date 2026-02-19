'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { SiteMetadata } from '../lib/sites';

interface UnescoSitesClientProps {
    initialSites: Site[];
    totalCount: number;
    metadata: SiteMetadata;
    currentPage: number;
    itemsPerPage: number;
    heroImage?: string | null;
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
    heroImage
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
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 lg:p-8">
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                                <span className="hidden lg:inline">UNESCO World Heritage Sites</span>
                                <span className="lg:hidden">UNESCO World Heritage</span>
                            </h1>
                            <p className="text-base lg:text-xl text-blue-100">
                                <span className="hidden lg:inline">Explore the world&apos;s most significant archaeological treasures.</span>
                                <span className="lg:hidden">Preserving our shared human history.</span>
                            </p>
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
                                                alt="UNESCO World Heritage"
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
                                        {/* Standard Text Content */}
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
                                                Some of the most recognizable sites include the <Link href="/sites/egypt/giza-pyramid-complex" className="font-bold underline">Pyramids of Giza</Link>, <Link href="/sites/cambodia/angkor" className="font-bold underline">Angkor Wat</Link>, <Link href="/sites/italy/pompeii" className="font-bold underline">Pompeii</Link>, and <Link href="/sites/mexico/chichen-itza" className="font-bold underline">Chichen Itza</Link>.
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
                                                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                            {countryOptions.map((country) => (
                                                                <CommandItem
                                                                    key={country.name}
                                                                    value={country.name.toLowerCase()}
                                                                    keywords={[country.name]}
                                                                    onSelect={() => {
                                                                        toggleCountry(country.name);
                                                                        setOpen(false);
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
                                                                    <span className="flex-1 truncate">
                                                                        {country.emoji} {country.cleanName}
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
                                                    const countryData = countryOptions.find(c => c.name === country) || { emoji: '🏳️', cleanName: cleanCountryName(country) };
                                                    return (
                                                        <Badge key={country} variant="secondary" className="pl-2 pr-1 py-1">
                                                            {countryData.emoji} {countryData.cleanName}
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

                                {/* Stats Card */}
                                <Card className="lg:col-span-1">
                                    <CardContent className="pt-6 h-full flex items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Award className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{totalCount}</div>
                                                <div className="text-sm text-gray-600">UNESCO Listed</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <SiteGrid
                                initialSites={initialSites}
                                showCountryContext={true}
                                manualPagination={true}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        disabled={currentPage <= 1}
                                        onClick={() => router.push(getPageLink(currentPage - 1), { scroll: true })}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => router.push(getPageLink(currentPage + 1), { scroll: true })}
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
