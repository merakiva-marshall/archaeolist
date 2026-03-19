import Image from 'next/image';
import { Star, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { ViatorTour } from '@/lib/viator/types';

export default function ViatorTours({ tours }: { tours: ViatorTour[] }) {
    if (!tours || tours.length === 0) return null;

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                    <GlobeIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Recommended Tours</h3>
                    <p className="text-sm text-gray-500">Top-rated experiences at this site</p>
                </div>
            </div>

            <div className="space-y-3">
                {tours.map((tour) => (
                    <a
                        key={tour.tour_id}
                        href={tour.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 rounded-xl border bg-white p-3 hover:shadow-md transition-shadow duration-200 group"
                    >
                        {/* Image */}
                        <div className="relative w-28 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            {tour.image_url ? (
                                <Image
                                    src={tour.image_url}
                                    alt={tour.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="112px"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <GlobeIcon className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                                    {tour.title}
                                </p>
                                {tour.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                        {tour.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium text-gray-700">{tour.rating}</span>
                                    <span className="text-xs text-gray-400">({tour.review_count?.toLocaleString()})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {tour.price && tour.price > 0 && (
                                        <span className="text-sm font-bold text-green-700">
                                            From {new Intl.NumberFormat('en-US', { style: 'currency', currency: tour.currency || 'USD', maximumFractionDigits: 0 }).format(tour.price)}
                                        </span>
                                    )}
                                    <Button className="bg-gray-900 hover:bg-black text-white h-7 text-xs px-2.5">
                                        Book <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <p className="text-[10px] text-gray-400 text-center pt-1">
                Powered by Viator. We may receive a commission for bookings made through these links.
            </p>
        </div>
    );
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}
