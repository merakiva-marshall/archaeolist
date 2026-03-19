import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase.rpc('recalculate_featured_scores');

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Scores recalculated successfully' });
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
