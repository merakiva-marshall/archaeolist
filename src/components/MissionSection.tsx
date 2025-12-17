
export default function MissionSection() {
    return (
        <section className="py-20 bg-white border-t border-gray-100 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intro Blurb */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Built This</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We&apos;re building something that should have existed years ago: a comprehensive, free database
                        of archaeological sites from around the world. The goal is simple—take all the scattered
                        information about these places and put it somewhere anyone can actually find it. Researchers,
                        travelers, students, or anyone curious about the past shouldn&apos;t have to dig through
                        academic paywalls or obscure government PDFs to learn where history happened.
                    </p>
                </div>

                {/* The Three Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Pillar 1 */}
                    <div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Making It Findable</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Most archaeological site information is buried in places regular people will never
                            look—subscription-only journals, regional heritage reports, or databases that
                            haven&apos;t been updated since 2003. That&apos;s a problem. Right now, we&apos;re focused on
                            aggregation: pulling together data from Wikipedia, UNESCO records, and dozens of
                            other sources into one searchable map. The idea is that if you&apos;re planning a trip
                            to Greece or just wondering what&apos;s worth seeing near your hometown, you shouldn&apos;t
                            need a PhD to figure it out.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Built to Grow</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Sites don&apos;t stop being discovered, and excavations don&apos;t stop producing new
                            information. What we&apos;re building isn&apos;t meant to be a static reference—it&apos;s
                            designed to eventually connect with active fieldwork. Archaeologists already have
                            to document and publish their findings for grants and academic requirements. If
                            we can make that process easier while also making the information public, everyone
                            wins. That&apos;s the longer-term vision: a platform that updates as discoveries
                            happen, not years after.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">The Real Story Is Better</h3>
                        <p className="text-gray-600 leading-relaxed">
                            There&apos;s a lot of nonsense out there about ancient civilizations—lost continents,
                            alien architects, that kind of thing. The frustrating part is that the actual
                            history is usually more interesting than the conspiracy theories. But when accurate
                            information is hard to find, people fill in the gaps with whatever&apos;s available.
                            By making real archaeological data accessible and readable, we&apos;re betting that
                            most people will choose facts over fiction when given the option. The engineering
                            behind the Pyramids or the logistics of Roman road networks are genuinely
                            impressive—no extraterrestrials required.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}
