'use client';

import { useForm, useNavigation, useDelete } from "@refinedev/core";

export default function SiteEdit({ params }: { params: { id: string } }) {
    const { list } = useNavigation();
    const { mutate: deleteSite } = useDelete();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { formLoading, onFinish, queryResult } = useForm({
        resource: "sites",
        id: params.id,
        action: "edit",
        redirect: "list"
    }) as any;

    const defaultData = queryResult?.data?.data;

    // Simple form handling. For a real app we'd use React Hook Form + resolver.
    // Refine's useForm works headless too.
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const updates: any = Object.fromEntries(formData.entries());

        // Handle Location
        if (updates.latitude && updates.longitude) {
            updates.location = {
                type: 'Point',
                coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)]
            };
            delete updates.latitude;
            delete updates.longitude;
        }

        onFinish(updates);
    };

    if (formLoading) {
        return <div className="p-8 text-slate-400">Loading site details...</div>;
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-amber-500">Edit Site</h1>
                <button
                    onClick={() => list("sites")}
                    className="text-sm text-slate-400 hover:text-white"
                >
                    ← Back to List
                </button>
            </div>

            <form key={defaultData?.id || 'new'} onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left Column: Core Info */}
                <div className="space-y-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-lg font-semibold text-slate-200">Core Information</h2>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Site Name</label>
                        <input
                            name="name"
                            defaultValue={defaultData?.name}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Country</label>
                        <input
                            name="country"
                            defaultValue={defaultData?.country}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Slug</label>
                        <input
                            name="slug"
                            defaultValue={defaultData?.slug}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Description</label>
                        <textarea
                            name="description"
                            rows={8}
                            defaultValue={defaultData?.description}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Right Column: Metadata & Location */}
                <div className="space-y-6">
                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-lg font-semibold text-slate-200">Location (Raw Data)</h2>
                        {/* Visualizing raw JSON/Array for location which is complex in this DB */}
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-slate-400">Coordinates (Lng, Lat)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="Longitude"
                                    defaultValue={defaultData?.location?.coordinates?.[0]}
                                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                                />
                                <input
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="Latitude"
                                    defaultValue={defaultData?.location?.coordinates?.[1]}
                                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-4">
                        <button
                            type="submit"
                            className="w-full rounded bg-amber-600 py-3 font-bold text-white hover:bg-amber-700"
                        >
                            Save Changes
                        </button>

                        <div className="border-t border-slate-800 pt-4">
                            <h3 className="mb-2 text-sm font-semibold text-red-500">Danger Zone</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this site? This cannot be undone.")) {
                                        // We need to use the delete mutation here. 
                                        // But useForm doesn't expose it directly in this mode.
                                        // We should import useDelete from @refinedev/core
                                        // See import above.
                                        deleteSite({ resource: "sites", id: params.id });
                                    }
                                }}
                                className="w-full rounded border border-red-900/50 bg-red-950/20 py-2 text-sm font-medium text-red-400 hover:bg-red-900/50"
                            >
                                Delete Site
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
