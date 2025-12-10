'use client';

import { useTable } from "@refinedev/core";
import { useState } from "react";

export default function ViatorSyncPage() {
    const [syncing, setSyncing] = useState(false);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const tableResult = useTable({
        resource: "viator_tours",
        pagination: { current: 1, pageSize: 20 } as any,
        sorters: { initial: [{ field: "last_updated", order: "desc" }] }
    }) as any;

    const tours = tableResult?.tableQueryResult?.data || { data: [] };
    const isLoading = tableResult?.tableQueryResult?.isLoading;

    const [logs, setLogs] = useState<string[]>([]);

    const handleSync = async (recursive = false) => {
        setSyncing(true);
        setLogs(prev => ["Starting batch...", ...prev]);

        try {
            const res = await fetch('/api/admin/viator-sync', {
                method: 'POST',
                body: JSON.stringify({ limit: 10 })
            });
            const json = await res.json();

            // Format log messages from results
            if (json.results && Array.isArray(json.results)) {
                const newLogs = json.results.map((r: any) => {
                    if (r.status === 'updated') return `✅ ${r.site}: Found ${r.toursFound} tours`;
                    if (r.status === 'no_tours_found') return `ℹ️ ${r.site}: No tours`;
                    if (r.status === 'no_nearby_destination') return `⚠️ ${r.site}: No nearby destination`;
                    if (r.status === 'skipped_no_coords') return `⚠️ ${r.site}: No coordinates`;
                    return `❓ ${r.site}: ${r.status}`;
                });
                setLogs(prev => [...newLogs, "----------------", ...prev]);
            } else {
                setLogs(prev => ["No results returned.", ...prev]);
            }

            // If recursive and we processed sites, keep going
            if (recursive && json.results && json.results.length > 0) {
                // Small delay to be nice to API/DB
                setTimeout(() => handleSync(true), 1000);
            } else {
                setSyncing(false);
                setLogs(prev => ["Sync Complete.", ...prev]);
                // Refresh table
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            setSyncing(false);
            setLogs(prev => ["Error occurred.", ...prev]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-amber-500">Viator Sync Manager</h1>
                    <p className="text-sm text-slate-400">Trigger manual updates to fetch tours for sites.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSync(false)}
                        disabled={syncing}
                        className="rounded bg-sky-600 px-4 py-3 font-bold text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                        {syncing ? "Syncing..." : "Sync Batch (10)"}
                    </button>
                    <button
                        onClick={() => handleSync(true)}
                        disabled={syncing}
                        className="rounded bg-amber-600 px-4 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        {syncing ? "Running..." : "Sync All"}
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-green-400">
                <p className="mb-2 font-bold text-slate-400">Activity Log:</p>
                <div className="max-h-32 overflow-y-auto flex flex-col-reverse">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-200">Recent Tours</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="border-b border-slate-700 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Tour Title</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-4">Loading...</td></tr>
                            ) : tours?.data.map((tour: any) => (
                                <tr key={tour.id}>
                                    <td className="max-w-md truncate px-4 py-3 font-medium text-slate-200" title={tour.title}>
                                        {tour.title}
                                    </td>
                                    <td className="px-4 py-3">{tour.currency} {tour.price}</td>
                                    <td className="px-4 py-3">{tour.rating} ({tour.review_count})</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(tour.last_updated).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
