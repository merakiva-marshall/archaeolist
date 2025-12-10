
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const queries = [
        { term: 'Pompeii', country: '' },
        { term: 'Chichen', country: '' }
    ];

    for (const q of queries) {
        let query = supabase.from('sites').select('name, country, slug').ilike('name', `%${q.term}%`);
        if (q.country) query = query.ilike('country', `%${q.country}%`);

        const { data, error } = await query.limit(5);
        console.log(`Search '${q.term}' (${q.country}):`, data);
    }
}
main();
