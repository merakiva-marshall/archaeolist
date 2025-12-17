
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const targetSites = [
    // South Africa
    "Cradle of Humankind",
    "Blombos Cave",
    "Mapungubwe",
    // Peru
    "Machu Picchu",
    "Nazca Lines",
    "Chan Chan",
    "Sacred Valley",
    // Egypt
    "Giza",
    "Karnak",
    "Valley of the Kings",
    "Abu Simbel",
    // Mexico
    "Teotihuacán",
    "Palenque",
    "Chichén Itzá",
    "Monte Albán",
    "Tulum"
];

async function findSlugs() {
    console.log("Searching for site slugs...");

    const results = {};

    for (const name of targetSites) {
        const { data, error } = await supabase
            .from('sites')
            .select('name, slug, country_slug')
            .ilike('name', `%${name}%`)
            .limit(1);

        if (error) {
            console.error(`Error searching for ${name}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            console.log(`✅ Found "${name}": /sites/${data[0].country_slug}/${data[0].slug} (Matches: ${data[0].name})`);
            results[name] = `/sites/${data[0].country_slug}/${data[0].slug}`;
        } else {
            console.log(`❌ Could not find exact match for "${name}"`);
            // Try broader search
            const { data: broadData } = await supabase
                .from('sites')
                .select('name, slug, country_slug')
                .textSearch('name', name.split(' ').join(' | '))
                .limit(1);

            if (broadData && broadData.length > 0) {
                console.log(`   Detailed search found: /sites/${broadData[0].country_slug}/${broadData[0].slug} (Matches: ${broadData[0].name})`);
                results[name] = `/sites/${broadData[0].country_slug}/${broadData[0].slug}`;
            }
        }
    }
}

findSlugs();
