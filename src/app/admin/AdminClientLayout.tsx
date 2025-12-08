'use client';

import { Refine, useLogout } from "@refinedev/core";
import Link from "next/link";

import { dataProvider } from "@refinedev/supabase";
import routerProvider from "@refinedev/nextjs-router";
import { authProvider, supabaseClient } from "@/lib/admin/authProvider";

// Resources
// We will define our specific resources here
const resources = [
    {
        name: "sites",
        list: "/admin/sites",
        create: "/admin/sites/create",
        edit: "/admin/sites/edit/:id",
        show: "/admin/sites/show/:id",
        meta: {
            canDelete: true,
            label: "Sites"
        },
    },
    {
        name: "viator",
        list: "/admin/viator",
        meta: {
            label: "Viator Sync"
        }
    }
];

// Inner component that can safely use Refine hooks
import { usePathname } from "next/navigation";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const { mutate } = useLogout();
    const pathname = usePathname();

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-row bg-slate-950 text-slate-100">
            <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
                <div className="mb-8 text-xl font-bold tracking-tighter text-blue-500">
                    ARCHAEOLIST <span className="text-xs text-slate-400">ADMIN</span>
                </div>
                <nav className="space-y-2">
                    <Link href="/admin/sites" className="block rounded px-4 py-2 hover:bg-slate-800 hover:text-blue-400">Sites</Link>
                    <Link href="/admin/viator" className="block rounded px-4 py-2 hover:bg-slate-800 hover:text-blue-400">Viator Sync</Link>
                    <div className="pt-4 border-t border-slate-800 space-y-2">
                        <a href="/" className="block text-sm text-slate-500 hover:text-slate-300">Exit to Site</a>
                        <button
                            onClick={() => mutate()}
                            className="block w-full text-left text-sm text-red-400 hover:text-red-300"
                        >
                            Log Out
                        </button>
                    </div>
                </nav>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}

export default function AdminClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Refine
            dataProvider={dataProvider(supabaseClient)}
            authProvider={authProvider}
            routerProvider={routerProvider}
            resources={resources}
            options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "archaeolist-admin",
            }}
        >
            <AdminLayoutInner>
                {children}
            </AdminLayoutInner>
        </Refine>
    );
}
