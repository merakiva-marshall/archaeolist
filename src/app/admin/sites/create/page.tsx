'use client';

import { useForm } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";

export default function CreateSite() {
    const { list } = useNavigation();
    const { onFinish, formLoading } = useForm({
        action: "create",
        resource: "sites",
        redirect: "list"
        /* eslint-disable @typescript-eslint/no-explicit-any */
    }) as any;

    const isLoading = formLoading;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        // Handle Location
        if (data.latitude && data.longitude) {
            data.location = {
                type: 'Point',
                coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)]
            };
            delete data.latitude;
            delete data.longitude;
        }

        onFinish(data);
    };

    return (
        <div className="max-w-2xl mx-auto rounded-lg border border-slate-800 bg-slate-900 p-8">
            <h1 className="mb-8 text-2xl font-bold text-blue-500">Add New Site</h1>
            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
                    <input
                        name="name"
                        required
                        className="w-full rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Country</label>
                    <input
                        name="country"
                        required
                        className="w-full rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Slug</label>
                    <input
                        name="slug"
                        required
                        className="w-full rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Longitude</label>
                        <input
                            name="longitude"
                            type="number"
                            step="any"
                            required
                            className="w-full rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Latitude</label>
                        <input
                            name="latitude"
                            type="number"
                            step="any"
                            required
                            className="w-full rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => list("sites")}
                        className="rounded px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Create Site"}
                    </button>
                </div>
            </form>
        </div>
    );
}
