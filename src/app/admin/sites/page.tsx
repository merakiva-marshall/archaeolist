'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTable, useNavigation } from "@refinedev/core";

export default function SitesList() {
    const { edit, create } = useNavigation();

    const { tableQueryResult, setFilters } = useTable({
        resource: "sites",
        pagination: {
            current: 1,
            pageSize: 50,
        } as any,
        sorters: {
            initial: [
                {
                    field: "name",
                    order: "asc",
                }
            ]
        }
    }) as any;

    const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name")?.toString();
        const country = formData.get("country")?.toString();

        const newFilters = [];
        if (name) {
            newFilters.push({
                field: "name",
                operator: "contains",
                value: name,
            });
        }
        if (country) {
            newFilters.push({
                field: "country",
                operator: "eq",
                value: country,
            });
        }

        setFilters(newFilters);
    };

    const data = tableQueryResult?.data || { data: [] };
    const isLoading = tableQueryResult?.isLoading;

    if (isLoading) {
        return <div className="p-4 text-slate-400">Loading sites...</div>;
    }

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-blue-500">Sites</h1>
                <button
                    onClick={() => create("sites")}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Add Site
                </button>
            </div>

            {/* Search Filters */}
            <form onSubmit={onSearch} className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <input
                    className="rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Search by Name..."
                    name="name"
                />
                <input
                    className="rounded border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Filter by Country..."
                    name="country"
                />
                <button type="submit" className="rounded bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700 border border-slate-700">
                    Search
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-slate-700 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Namn</th>
                            <th className="px-4 py-3">Country</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data?.data.map((site: any) => (
                            <tr key={site.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium text-slate-200">{site.name}</td>
                                <td className="px-4 py-3">{site.country}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => edit("sites", site.id)}
                                        className="text-amber-500 hover:text-amber-400 hover:underline mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Sync Viator tours for ${site.name}?`)) {
                                                try {
                                                    const res = await fetch('/api/admin/viator-sync', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ siteIds: [site.id] })
                                                    });
                                                    const json = await res.json();

                                                    if (!res.ok) {
                                                        alert(`Sync failed: ${json.error || 'Unknown error'}`);
                                                    } else {
                                                        // Format the results for display
                                                        const resultMsg = json.results.map((r: any) =>
                                                            `${r.site}: ${r.status} ${r.toursFound ? `(${r.toursFound} tours)` : ''}`
                                                        ).join('\n');
                                                        alert(`Sync Complete:\n${resultMsg}`);
                                                    }
                                                } catch (e) {
                                                    const msg = e instanceof Error ? e.message : "Network error";
                                                    alert(`Sync failed: ${msg}`);
                                                }
                                            }
                                        }}
                                        className="text-sky-500 hover:text-sky-400 hover:underline"
                                    >
                                        Sync
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {data?.data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-slate-500">No sites found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 rounded bg-slate-800 p-4">
                <p className="font-bold text-red-400">Refine Debug Info:</p>
                <pre className="text-xs text-slate-400 overflow-auto max-h-40">
                    {JSON.stringify({
                        isLoading: tableQueryResult?.isLoading,
                        isError: tableQueryResult?.isError,
                        error: tableQueryResult?.error,
                        dataLength: data?.data?.length,
                        total: data?.total
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
