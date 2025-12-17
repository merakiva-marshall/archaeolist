
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const missingSites = [
    "Cradle", // for Cradle of Humankind
    "Blombos",
    "Karnak", // maybe part of Ancient Thebes?
    "Teotihuacan",
    "Chichen",
    "Tulum",
    "Great Wall",
    "Petra"
];

async function findMissing() {
    for (const term of missingSites) {
        const { data } = await supabase
            .from('sites')
            .select('name, slug, country_slug')
            .ilike('name', `%${term}%`)
            .limit(3);

        console.log(`Results for "${term}":`);
        if (data) {
            data.forEach(s => console.log(`  - ${s.name}: /sites/${s.country_slug}/${s.slug}`));
        } else {
            console.log("  None found.");
        }
    }
}

findMissing();
