
import Link from 'next/link'

const countries = [
    {
        name: "South Africa",
        slug: "south-africa",
        // Generic SA image or placeholder if needed. Unsplash ID for SA: 
        image: "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&q=80&w=800",
        description: (
            <>
                South Africa is where the story of humanity literally starts. The <Link href="/sites/south-africa/malapa-fossil-site-cradle-of-humankind" className="text-blue-600 hover:underline">Cradle of Humankind</Link>, a UNESCO site about an hour from Johannesburg, has produced more hominin fossils than anywhere else on Earth—including famous specimens like &quot;Mrs. Ples&quot; and &quot;Little Foot&quot; that are millions of years old. <Link href="/sites/south-africa/blombos-cave" className="text-blue-600 hover:underline">Blombos Cave</Link> on the coast has some of the earliest evidence of human symbolic thinking: shell beads and ochre engravings from 75,000+ years ago. Then there&apos;s the rock art. The San people painted thousands of sites across the Drakensberg mountains and elsewhere, creating one of the longest artistic traditions in human history. For something more recent (but still pre-colonial), <Link href="/sites/south-africa/kingdom-of-mapungubwe" className="text-blue-600 hover:underline">Mapungubwe</Link> in the north was a powerful medieval trading kingdom with gold artifacts and connections to the Swahili coast. It&apos;s a country where you can see both the deep origins of our species and the complexity of African civilizations that European history books largely ignored.
            </>
        )
    },
    {
        name: "Peru",
        slug: "peru",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800",
        description: (
            <>
                Everyone knows <Link href="/sites/cusco-region/machu-picchu" className="text-blue-600 hover:underline">Machu Picchu</Link>, but Peru&apos;s archaeological story goes back thousands of years before the Incas showed up. The <Link href="/sites/peru/nazca-lines" className="text-blue-600 hover:underline">Nazca Lines</Link>—huge geoglyphs carved into the desert that you can only really see from the air—are still genuinely mysterious. <Link href="/sites/peru/chan-chan" className="text-blue-600 hover:underline">Chan Chan</Link>, near the coast, was one of the largest adobe cities ever built. And the <Link href="/sites/cusco-region/sacred-valley" className="text-blue-600 hover:underline">Sacred Valley</Link> is packed with Inca sites that get a fraction of the crowds Machu Picchu does. The geography helps too: you&apos;ve got coastal desert, the Andes at 15,000+ feet, and the edge of the Amazon all in one country, each region with its own history of settlement.
            </>
        )
    },
    {
        name: "Egypt",
        slug: "egypt",
        // New image for Egypt (Pyramids): https://images.unsplash.com/photo-1503177119275-0aa32b3a9368
        image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800",
        description: (
            <>
                The pyramids at <Link href="/sites/egypt/giza-pyramid-complex" className="text-blue-600 hover:underline">Giza</Link> are probably the most famous archaeological site on Earth, and they&apos;re worth the hype. But they&apos;re really just the starting point. Head south along the Nile and you hit Luxor, where the <Link href="/sites/egypt/ancient-thebes-with-its-necropolis" className="text-blue-600 hover:underline">Karnak Temple</Link> complex is so large it takes hours to walk through properly. Across the river is the <Link href="/sites/egypt/valley-of-the-kings" className="text-blue-600 hover:underline">Valley of the Kings</Link>, where Tutankhamun&apos;s tomb was found. Keep going south and you reach <Link href="/sites/egypt/abu-simbel" className="text-blue-600 hover:underline">Abu Simbel</Link>, where Ramesses II carved massive temples directly into the cliff face. Egyptian civilization lasted over 3,000 years—longer than the time between us and the Romans—so there&apos;s a lot of ground to cover.
            </>
        )
    },
    {
        name: "Mexico",
        slug: "mexico",
        image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=800",
        description: (
            <>
                Mexico is where you realize how much was happening in the Americas before 1492. <Link href="/sites/mexico/teotihuacan" className="text-blue-600 hover:underline">Teotihuacán</Link>, about an hour outside Mexico City, has pyramids that were among the largest structures in the world when they were built—and we still don&apos;t know exactly who built them. The Maya sites in the south, like <Link href="/sites/mexico/palenque" className="text-blue-600 hover:underline">Palenque</Link>, are half-swallowed by jungle and covered in hieroglyphic inscriptions. <Link href="/sites/mexico/chichen-itza" className="text-blue-600 hover:underline">Chichén Itzá</Link> gets the most visitors, but sites like <Link href="/sites/mexico/monte-alban" className="text-blue-600 hover:underline">Monte Albán</Link> (Zapotec) or Tulum (Maya, right on the Caribbean coast) are just as impressive in different ways. These weren&apos;t primitive societies—they had writing, detailed astronomical calendars, and urban planning that rivaled anything in Europe at the time.
            </>
        )
    }
]

export default function PopularCountries() {
    return (
        <section className="py-16 bg-slate-50 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl text-left">Popular Countries</h2>
                    <p className="mt-4 text-xl text-gray-500 text-left max-w-2xl">
                        Start your journey by exploring these countries rich in history and archaeological heritage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {countries.map((country) => (
                        <div key={country.slug} className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="relative h-48 w-full">
                                <img
                                    src={country.image}
                                    alt={`Archaeological sites in ${country.name}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                                    {country.name}
                                </h3>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                                    {country.description}
                                </div>
                                <Link
                                    href={`/sites/${country.slug}`}
                                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors mt-auto"
                                >
                                    Explore {country.name}
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
