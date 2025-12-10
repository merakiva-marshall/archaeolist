import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { syncSites } from '@/lib/viator/sync';

export async function POST(request: Request) {
    // 1. Auth Check - Placeholder for now as discussed
    // We initialize the client to verify environment variables presence primarily
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        // Limit is defined but not yet used by syncSites, keeping for future Extensibility
        // const { searchParams } = new URL(request.url);
        // const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

        const body = await request.json().catch(() => ({}));
        const { siteIds, searchQuery, limit } = body;

        // Use limit from body, or default to 5 if not provided (syncSites handles default too)
        const batchSize = limit ? parseInt(limit) : 5;

        const results = await syncSites(siteIds, searchQuery, batchSize);

        return NextResponse.json({
            success: true,
            results: results
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
