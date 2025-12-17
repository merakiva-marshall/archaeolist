
import Link from 'next/link'

export default function AboutProject() {
    return (
        <section className="py-16 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">About the Project</h2>
                <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
                    <p className="mb-6">
                        Archaeolist is built to make the world&apos;s ancient history accessible and findable.
                        We believe that every site has a story worth telling, whether it&apos;s a famous wonder or a hidden ruin.
                        Our goal is to connect people with projects, preserving our shared heritage for future generations.
                    </p>
                    <p>
                        The project is led by <Link href="https://merakivatravel.com/about-us#marshall-schurtz" className="text-blue-600 font-semibold hover:underline">Marshall Schurtz, PhD</Link>,
                        an archaeologist trained at the University of Pennsylvania and with experience at digs around the world including Lebanon, Iraq, and Spain.
                    </p>
                </div>
            </div>
        </section>
    )
}
