
import Link from 'next/link'

export default function AboutProject() {
    return (
        <section className="py-16 bg-surface-container-low border-t border-outline-variant">
            <div className="max-w-4xl mx-auto px-8 text-center">
                <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">The Team</span>
                <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-6">About the Project</h2>
                <div className="mx-auto text-on-surface">
                    <p className="text-base font-body leading-loose mb-6">
                        Archaeolist is built to make the world&apos;s ancient history accessible and findable.
                        We believe that every site has a story worth telling, whether it&apos;s a famous wonder or a hidden ruin.
                        Our goal is to connect people with projects, preserving our shared heritage for future generations.
                    </p>
                    <p className="text-base font-body leading-loose">
                        The project is led by <Link href="https://merakivatravel.com/about-us#marshall-schurtz" className="text-primary-brand font-semibold hover:underline">Marshall Schurtz, PhD</Link>,
                        an archaeologist trained at the University of Pennsylvania and with experience at digs around the world including Lebanon, Iraq, and Spain.
                    </p>
                </div>
            </div>
        </section>
    )
}
