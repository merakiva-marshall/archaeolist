'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Site } from '../types/site';
import SiteGrid from './SiteGrid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, MapPin, Award, Check, ChevronsUpDown, X, Info } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '../lib/utils';
import lookup from 'country-code-lookup';
import { Card, CardContent } from './ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Checkbox } from './ui/checkbox';

interface AllSitesClientProps {
    initialSites: Site[];
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

// Period Colors (Earthy/Historical/Warm)
function generatePeriodColor(text: string): { bg: string; text: string; border: string } {
    // Use a predictable hash
    const hash = Array.from(text).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Constrain to "Earthy" tones: Oranges, Browns, Yellows, Warm Greens
    // Hues ~20 (Brown/Orange) to ~60 (Yellow) to ~150 (Green)
    // Let's map the hash to a specific set of nice earthy hues
    const earthyHues = [30, 45, 180, 200, 210]; // Warm browns, golds, and slate blues for "Time"
    const h = earthyHues[Math.abs(hash) % earthyHues.length];

    const s = 30 + (Math.abs(hash) % 30); // 30-60% saturation (muted)
    const l = 90 + (Math.abs(hash) % 6); // 90-96% lightness (very light background)

    return {
        bg: `hsl(${h}, ${s}%, ${l}%)`,
        text: `hsl(${h}, ${s}%, 20%)`,
        border: `hsl(${h}, ${s}%, ${l - 15}%)`,
    };
}

// Feature Colors (Vibrant/Varied/Distinct)
function generateFeatureColor(text: string): { bg: string; text: string; border: string } {
    const hash = Array.from(text).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Full spectrum but distinct from periods (avoiding the exact earthy muds if possible)
    const h = Math.abs(hash) % 360;
    const s = 60 + (Math.abs(hash) % 30); // 60-90% saturation (more vibrant)
    const l = 92 + (Math.abs(hash) % 5); // 92-97% lightness

    return {
        bg: `hsl(${h}, ${s}%, ${l}%)`,
        text: `hsl(${h}, ${s}%, 20%)`,
        border: `hsl(${h}, ${s}%, ${l - 10}%)`,
    };
}

const PERIOD_ORDER = [
    "Paleolithic",
    "Mesolithic",
    "Neolithic",
    "Chalcolithic",
    "Bronze Age",
    "Iron Age",
    "Classical Period",
    "Post-Classical Period",
    "Early Modern Period",
    "Industrial Period",
    "Contemporary Period"
];


type SortOption = 'featured' | 'recent' | 'updated_desc' | 'updated_asc';

// Helper for "Featured" scoring
const calculateFeaturedScore = (site: Site) => {
    let score = 0;

    // Prioritize Timeline & Features
    if (site.timeline) score += 20;
    if (site.features && site.features.length > 0) score += 20;
    if (site.processed_features && Object.keys(site.processed_features).length > 0) score += 10;

    // Images
    if (site.images && site.images.length > 0) {
        score += 10;
        score += Math.min(site.images.length, 5) * 2; // Up to 10 points for more images
    }

    // Recency (Recently Added)
    // Add small boost for new sites to keep content fresh, but prioritize quality content first
    const created = new Date(site.created_at || 0).getTime();
    const now = Date.now();
    const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < 30) score += 15;
    else if (daysSinceCreation < 90) score += 10;
    else if (daysSinceCreation < 365) score += 5;

    return score;
};

export default function AllSitesClient({ initialSites }: AllSitesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filter states
    const [countryOpen, setCountryOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [featureOpen, setFeatureOpen] = useState(false);

    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [unescoOnly, setUnescoOnly] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('featured');

    // Initialize from URL
    useEffect(() => {
        const countriesParam = searchParams.get('countries');
        if (countriesParam) setSelectedCountries(countriesParam.split(','));

        const periodsParam = searchParams.get('periods');
        if (periodsParam) setSelectedPeriods(periodsParam.split(','));

        const featuresParam = searchParams.get('features');
        if (featuresParam) setSelectedFeatures(featuresParam.split(','));

        const unescoParam = searchParams.get('unesco');
        if (unescoParam === 'true') setUnescoOnly(true);

        const sortParam = searchParams.get('sort');
        if (sortParam && ['featured', 'recent', 'updated_desc', 'updated_asc'].includes(sortParam)) {
            setSortBy(sortParam as SortOption);
        }
    }, [searchParams]);

    // Update URL helper
    const updateUrl = (
        countries: string[],
        periods: string[],
        features: string[],
        unesco: boolean,
        sort: SortOption
    ) => {
        const params = new URLSearchParams(searchParams);

        if (countries.length > 0) params.set('countries', countries.join(','));
        else params.delete('countries');

        if (periods.length > 0) params.set('periods', periods.join(','));
        else params.delete('periods');

        if (features.length > 0) params.set('features', features.join(','));
        else params.delete('features');

        if (unesco) params.set('unesco', 'true');
        else params.delete('unesco');

        if (sort !== 'featured') params.set('sort', sort); // Default doesn't need param
        else params.delete('sort');

        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Handlers
    const toggleCountry = (country: string) => {
        const newSelection = selectedCountries.includes(country)
            ? selectedCountries.filter(c => c !== country)
            : [...selectedCountries, country];
        setSelectedCountries(newSelection);
        updateUrl(newSelection, selectedPeriods, selectedFeatures, unescoOnly, sortBy);
    };

    const togglePeriod = (period: string) => {
        const newSelection = selectedPeriods.includes(period)
            ? selectedPeriods.filter(p => p !== period)
            : [...selectedPeriods, period];
        setSelectedPeriods(newSelection);
        updateUrl(selectedCountries, newSelection, selectedFeatures, unescoOnly, sortBy);
    };

    const toggleFeature = (feature: string) => {
        const newSelection = selectedFeatures.includes(feature)
            ? selectedFeatures.filter(f => f !== feature)
            : [...selectedFeatures, feature];
        setSelectedFeatures(newSelection);
        updateUrl(selectedCountries, selectedPeriods, newSelection, unescoOnly, sortBy);
    };

    const toggleUnesco = (checked: boolean) => {
        setUnescoOnly(checked);
        updateUrl(selectedCountries, selectedPeriods, selectedFeatures, checked, sortBy);
    };

    const handleSortChange = (sort: string) => {
        const newSort = sort as SortOption;
        setSortBy(newSort);
        updateUrl(selectedCountries, selectedPeriods, selectedFeatures, unescoOnly, newSort);
    };

    const clearFilters = () => {
        setSelectedCountries([]);
        setSelectedPeriods([]);
        setSelectedFeatures([]);
        setUnescoOnly(false);
        updateUrl([], [], [], false, sortBy);
    };

    const removeFilter = (type: 'country' | 'period' | 'feature', value: string) => {
        if (type === 'country') {
            const newSelection = selectedCountries.filter(c => c !== value);
            setSelectedCountries(newSelection);
            updateUrl(newSelection, selectedPeriods, selectedFeatures, unescoOnly, sortBy);
        } else if (type === 'period') {
            const newSelection = selectedPeriods.filter(p => p !== value);
            setSelectedPeriods(newSelection);
            updateUrl(selectedCountries, newSelection, selectedFeatures, unescoOnly, sortBy);
        } else {
            const newSelection = selectedFeatures.filter(f => f !== value);
            setSelectedFeatures(newSelection);
            updateUrl(selectedCountries, selectedPeriods, newSelection, unescoOnly, sortBy);
        }
    };


    // Derived Data
    const countries = useMemo(() => {
        const uniqueCountries = new Set(initialSites.map(site => site.country).filter(Boolean));
        return Array.from(uniqueCountries)
            .map(country => ({
                name: country!,
                cleanName: cleanCountryName(country!),
                emoji: getCountryEmoji(country!)
            }))
            .filter(c => c.emoji !== null)
            .sort((a, b) => a.cleanName.localeCompare(b.cleanName));
    }, [initialSites]);

    const periods = useMemo(() => {
        // Only show periods from the accepted definition list, in order
        return PERIOD_ORDER.filter(period => {
            return initialSites.some(site =>
                site.processed_periods && Object.prototype.hasOwnProperty.call(site.processed_periods, period)
            );
        }).map(p => ({
            name: p,
            ...generatePeriodColor(p)
        }));
    }, [initialSites]);

    const features = useMemo(() => {
        const allFeatures = initialSites.flatMap(site =>
            site.processed_features ? Object.keys(site.processed_features) : []
        ).filter(Boolean);
        const uniqueFeatures = Array.from(new Set(allFeatures)).sort();

        return uniqueFeatures.map(f => ({
            name: f,
            ...generateFeatureColor(f)
        }));
    }, [initialSites]);

    const filteredSites = useMemo(() => {
        let result = initialSites;

        // Filter by Country
        if (selectedCountries.length > 0) {
            result = result.filter(site => site.country && selectedCountries.includes(site.country));
        }

        // Filter by Period
        if (selectedPeriods.length > 0) {
            result = result.filter(site =>
                site.processed_periods && Object.keys(site.processed_periods).some(p => selectedPeriods.includes(p))
            );
        }

        // Filter by Feature
        if (selectedFeatures.length > 0) {
            result = result.filter(site =>
                site.processed_features && Object.keys(site.processed_features).some(f => selectedFeatures.includes(f))
            );
        }

        // Filter by UNESCO
        if (unescoOnly) {
            result = result.filter(site => site.is_unesco);
        }

        // Sort
        return result.sort((a, b) => {
            if (sortBy === 'featured') {
                const scoreA = calculateFeaturedScore(a);
                const scoreB = calculateFeaturedScore(b);
                if (scoreA !== scoreB) return scoreB - scoreA;
                // Tie break with recent
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            } else if (sortBy === 'recent') {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            } else if (sortBy === 'updated_desc') {
                const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                return dateB - dateA;
            } else { // updated_asc
                const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                return dateA - dateB;
            }
        });
    }, [initialSites, selectedCountries, selectedPeriods, selectedFeatures, unescoOnly, sortBy]);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <h1 className="text-4xl font-bold">All Archaeological Sites</h1>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="default" className="bg-transparent shadow-none hover:bg-white/10 text-blue-200 hover:text-white rounded-full h-8 w-8 p-0 flex items-center justify-center">
                                            <Info className="h-5 w-5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-6 text-sm leading-relaxed" align="start">
                                        <div className="space-y-4">
                                            <p>
                                                Welcome to the ultimate global directory of archaeological sites and ancient ruins. Our comprehensive database offers travelers, history enthusiasts, and researchers a curated collection of the world&apos;s most significant historical landmarks. From the monumental Pyramids of Giza to the hidden temples of Southeast Asia, explore the diverse cultural heritage that spans millennia of human history. Use our advanced filtering tools to browse sites by country, time period, or specific features to discover the architectural marvels of the Roman Empire, the mysterious megaliths of prehistoric Europe, and the sacred cities of the Maya. We prioritize high-quality data, ensuring you have the most accurate details for your research or travel planning. Join us in preserving and appreciating our shared human story.
                                            </p>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <p className="text-xl text-blue-100 max-w-3xl font-medium">
                                Explore our comprehensive directory of archaeological sites, ancient ruins, and historical landmarks from around the world.
                            </p>
                        </div>
                    </div>

                    {/* Stats & Actions Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {/* Always show total count unless filtered? User asked: "just have the default the whole database count (since we only retreive 1000), it can then be dynamic when filtered"
                            If I have 1000 sites loaded, this will show 1000. 
                            If filtered, it shows filtered count which is correct behavior described.
                         */}
                                            {filteredSites.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Archaeological Sites</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Award className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {filteredSites.filter(s => s.is_unesco).length}
                                        </div>
                                        <div className="text-sm text-gray-600">UNESCO World Heritage Sites</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Link href="/">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <MapPin className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">Interactive Map</div>
                                            <div className="text-sm text-gray-600">View Global Map</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Filters & Sort Bar */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">

                            {/* Country Filter */}
                            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full md:w-[200px] justify-between bg-white">
                                        {selectedCountries.length > 0 ? `${selectedCountries.length} countries` : "Country"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search country..." />
                                        <CommandList>
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                {countries.map((country) => (
                                                    <CommandItem
                                                        key={country.name}
                                                        value={country.name}
                                                        onSelect={() => toggleCountry(country.name)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCountries.includes(country.name) ? "opacity-100" : "opacity-0"
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

                            {/* Period Filter */}
                            <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={periodOpen} className="w-full md:w-[200px] justify-between bg-white">
                                        {selectedPeriods.length > 0 ? `${selectedPeriods.length} periods` : "Period"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search period..." />
                                        <CommandList>
                                            <CommandEmpty>No period found.</CommandEmpty>
                                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                {periods.map((period) => (
                                                    <CommandItem
                                                        key={period.name}
                                                        value={period.name}
                                                        onSelect={() => togglePeriod(period.name)}
                                                        className="cursor-pointer my-1"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedPeriods.includes(period.name) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span
                                                            className="px-2 py-0.5 rounded-md text-sm font-medium w-full truncate"
                                                            style={{
                                                                backgroundColor: period.bg,
                                                                color: period.text,
                                                                border: `1px solid ${period.border}`
                                                            }}
                                                        >
                                                            {period.name}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* Features Filter */}
                            <Popover open={featureOpen} onOpenChange={setFeatureOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={featureOpen} className="w-full md:w-[200px] justify-between bg-white">
                                        {selectedFeatures.length > 0 ? `${selectedFeatures.length} features` : "Features"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[320px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search feature..." />
                                        <CommandList>
                                            <CommandEmpty>No feature found.</CommandEmpty>
                                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                {features.map((feature) => (
                                                    <CommandItem
                                                        key={feature.name}
                                                        value={feature.name}
                                                        onSelect={() => toggleFeature(feature.name)}
                                                        className="cursor-pointer my-1"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedFeatures.includes(feature.name) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span
                                                            className="px-2 py-0.5 rounded-md text-sm font-medium w-full text-wrap"
                                                            style={{
                                                                backgroundColor: feature.bg,
                                                                color: feature.text,
                                                                border: `1px solid ${feature.border}`
                                                            }}
                                                        >
                                                            {feature.name}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* UNESCO Checkbox */}
                            <div className="flex items-center space-x-2 border rounded-md px-3 h-10 bg-white">
                                <Checkbox id="unesco-filter" checked={unescoOnly} onCheckedChange={(c) => toggleUnesco(c as boolean)} />
                                <label
                                    htmlFor="unesco-filter"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    UNESCO Only
                                </label>
                            </div>

                            <div className="flex-1" />

                            {/* Sorting */}
                            <div className="flex flex-col gap-1 w-full md:w-auto min-w-[200px]">
                                <span className="text-xs text-gray-500 font-medium ml-1">Sort by</span>
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">Featured</SelectItem>
                                        <SelectItem value="updated_desc">Recently Updated</SelectItem>
                                        <SelectItem value="recent">Most Recent (Added)</SelectItem>
                                        <SelectItem value="updated_asc">Last Updated (Oldest)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(selectedCountries.length > 0 || selectedPeriods.length > 0 || selectedFeatures.length > 0 || unescoOnly) && (
                            <div className="flex flex-wrap gap-2 items-center">
                                {unescoOnly && (
                                    <>
                                        <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center bg-amber-100 text-amber-800 hover:bg-amber-100">
                                            <Award className="w-3 h-3 mr-1" />
                                            UNESCO Only
                                            <button
                                                onClick={() => toggleUnesco(false)}
                                                className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                        <span className="text-gray-300 mx-1">|</span>
                                    </>
                                )}

                                {selectedCountries.length > 0 && (
                                    <>
                                        {selectedCountries.map(country => {
                                            const countryData = countries.find(c => c.name === country);
                                            return (
                                                <Badge key={country} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                                                    <span className="mr-1">{countryData?.emoji}</span>
                                                    {cleanCountryName(country)}
                                                    <button
                                                        onClick={() => removeFilter('country', country)}
                                                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                        <span className="text-gray-300 mx-1">|</span>
                                    </>
                                )}

                                {selectedPeriods.length > 0 && (
                                    <>
                                        {selectedPeriods.map(period => {
                                            const colors = generatePeriodColor(period);
                                            return (
                                                <Badge
                                                    key={period}
                                                    variant="secondary"
                                                    className="pl-2 pr-1 py-1 flex items-center border"
                                                    style={{
                                                        backgroundColor: colors.bg,
                                                        color: colors.text,
                                                        borderColor: colors.border
                                                    }}
                                                >
                                                    {period}
                                                    <button
                                                        onClick={() => removeFilter('period', period)}
                                                        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                        <span className="text-gray-300 mx-1">|</span>
                                    </>
                                )}

                                {selectedFeatures.length > 0 && (
                                    <>
                                        {selectedFeatures.map(feature => {
                                            const colors = generateFeatureColor(feature);
                                            return (
                                                <Badge
                                                    key={feature}
                                                    variant="secondary"
                                                    className="pl-2 pr-1 py-1 flex items-center border"
                                                    style={{
                                                        backgroundColor: colors.bg,
                                                        color: colors.text,
                                                        borderColor: colors.border
                                                    }}
                                                >
                                                    {feature}
                                                    <button
                                                        onClick={() => removeFilter('feature', feature)}
                                                        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                        <span className="text-gray-300 mx-1">|</span>
                                    </>
                                )}

                                <Button
                                    variant="default"
                                    className="h-7 text-xs bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200 shadow-none border-0"
                                    onClick={clearFilters}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mb-4 text-sm text-gray-500 font-medium">
                        Showing {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
                    </div>

                    <SiteGrid
                        initialSites={filteredSites}
                        showCountryContext={true}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
