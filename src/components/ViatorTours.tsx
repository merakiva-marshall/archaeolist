import Image from 'next/image';
import { Star, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { ViatorTour } from '@/lib/viator/types';

export default function ViatorTours({ tours }: { tours: ViatorTour[] }) {
    if (!tours || tours.length === 0) return null;

    return (
        <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                    <GlobeIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Recommended Tours</h3>
                    <p className="text-sm text-gray-500">Top-rated experiences near this site</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                    <div key={tour.id} className="group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                            {tour.image_url ? (
                                <Image
                                    src={tour.image_url}
                                    alt={tour.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    unoptimized
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col flex-grow bg-white">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-snug min-h-[2.5em]" title={tour.title}>
                                {tour.title}
                            </h4>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center text-yellow-400">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{tour.rating}</span>
                                <span className="text-xs text-gray-400">({tour.review_count} reviews)</span>
                            </div>

                            <div className="mt-auto pt-3 border-t border-gray-100">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col">
                                        {tour.price && tour.price > 0 ? (
                                            <>
                                                <span className="text-xs text-gray-500 font-medium">From</span>
                                                <span className="font-bold text-lg text-green-700">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: tour.currency || 'USD' }).format(tour.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="font-bold text-lg text-green-700">View Price</span>
                                        )}
                                    </div>

                                    <a href={tour.url || '#'} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button className="w-full bg-gray-900 hover:bg-black text-white h-9 text-sm font-medium">
                                            Book Now
                                            <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-gray-400">
                    Powered by Viator. We may receive a commission for bookings made through these links.
                </p>
            </div>
        </div>
    );
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
}
