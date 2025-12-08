
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const sitesToAudit = [
    'Ephesus', // User reported issue
    'Colosseum', // Try partial match
    'Machu Picchu',
    'Petra',
    'Pompeii'
];

async function audit() {
    console.log('--- Auditing Tour Filters ---');

    for (const siteName of sitesToAudit) {
        console.log(`\nChecking: ${siteName}...`);

        // 1. Get Site Data
        const { data: sites } = await supabase
            .from('sites')
            .select('id, name')
            .ilike('name', `%${siteName}%`)
            .limit(1);

        if (!sites || sites.length === 0) {
            console.log(`❌ Site not found.`);
            continue;
        }
        const site = sites[0];
        console.log(`Site ID: ${site.id} | Name: ${site.name}`);

        // CHECK TOTAL COUNT
        const { count } = await supabase
            .from('viator_tours')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', site.id);

        console.log(`TOTAL Linked Tours in DB: ${count}`);

        // 2. Fetch Raw Data (Top 100 by reviews)
        const { data: tours } = await supabase
            .from('viator_tours')
            .select('*')
            .eq('site_id', site.id)
            .order('review_count', { ascending: false })
            .limit(100);

        if (!tours || tours.length === 0) {
            console.log(`⚠️ No tours found in DB.`);
            continue;
        }

        console.log(`Fetched: ${tours.length} candidates.`);

        // 3. Simulate Filters
        // Generate Keywords
        const stopWords = ['the', 'a', 'an', 'of', 'in', 'at', 'archaeological', 'site', 'ruins', 'park', 'great', 'complex', 'city', 'ancient'];
        const keywords = site.name.toLowerCase().split(' ')
            .filter(w => !stopWords.includes(w) && w.length > 2);

        console.log(`Keywords: [${keywords.join(', ')}]`);

        let kept = 0;
        let droppedPrice = 0;
        let droppedRelevance = 0;
        const acceptedTours = [];

        tours.forEach(t => {
            // Logic from page.tsx
            const priceValid = (t.price !== null && t.price !== undefined && t.price > 0) || t.price === null || t.price === undefined;
            // Wait, user said fallback to check price. My code says:
            // if (t.price !== null && t.price !== undefined && t.price <= 0) return false;
            // So null is ALLOWED. 0 works if logic is exactly: t.price <= 0.

            // Let's re-verify exact logic:
            // if (t.price !== null && t.price !== undefined && t.price <= 0) return false;
            // Meaning: if price EXISTS and is <= 0, drop. If price is null/undefined, KEEP.

            const isZeroPrice = t.price !== null && t.price !== undefined && t.price <= 0;

            if (isZeroPrice) {
                droppedPrice++;
                return;
            }

            const titleLower = t.title.toLowerCase();
            const hasKeyword = keywords.length > 0 ? keywords.some(k => titleLower.includes(k)) : true;

            if (!hasKeyword) {
                droppedRelevance++;
                return;
            }

            kept++;
            acceptedTours.push(t);
        });

        console.log(`Results:`);
        console.log(`✅ Kept: ${kept}`);
        console.log(`❌ Dropped (Price <= 0): ${droppedPrice}`);
        console.log(`❌ Dropped (Relevance): ${droppedRelevance}`);

        if (kept > 0) {
            // Show price stats
            const prices = acceptedTours.map(t => t.price || 0).sort((a, b) => a - b);
            console.log(`Prices: Low: $${prices[0]} | High: $${prices[prices.length - 1]} | Avg: $${(prices.reduce((a, b) => a + b, 0) / kept).toFixed(2)}`);

            // Show first 3 accepted
            console.log('Top 3 Accepted:');
            acceptedTours.slice(0, 3).forEach(t => console.log(` - [${t.review_count} revs, $${t.price}] ${t.title}`));

            // Show first 3 rejected relevance (to see if strictness is issue)
            if (droppedRelevance > 0) {
                console.log('Sample Rejected (Relevance):');
                tours.filter(t => !keywords.some(k => t.title.toLowerCase().includes(k)) && !(t.price !== null && t.price <= 0))
                    .slice(0, 3)
                    .forEach(t => console.log(` - [${t.title}]`));
            }
        }
    }
}

audit();
