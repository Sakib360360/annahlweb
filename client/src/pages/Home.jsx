import FeatureGrid from '../components/FeatureGrid'
import Hero from '../components/Hero'
import SchoolStats from '../components/SchoolStats'
import TestimonialSlider from '../components/TestimonialSlider'

export default function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1">
        <SchoolStats />

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-brand-900">Programs we offer</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            From foundation year to higher secondary, our structured program ensures each student grows in knowledge and character.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <h3 className="text-xl font-semibold text-brand-900">Early Years & Primary</h3>
              <p className="mt-3 text-slate-600">
                A nurturing environment where young learners explore reading, basic math, and Quranic studies through engaging activities.
              </p>
              <ul className="mt-6 space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  Islamic studies & character building
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  Literacy, numeracy, and STEAM play
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  Creative arts and physical development
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <h3 className="text-xl font-semibold text-brand-900">Secondary & A-Levels</h3>
              <p className="mt-3 text-slate-600">
                Advanced academic preparation aligned with international standards, with support for competitive exams and leadership.
              </p>
              <ul className="mt-6 space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  GCSE / IGCSE & A-Level pathways
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  Strong STEM, humanities, and Islamic studies
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  University guidance and counseling
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-white/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl font-semibold text-brand-900">Why choose Al Nahal Academy?</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              We combine modern teaching methods with a nurturing Islamic environment, so students thrive academically and spiritually.
            </p>
            <FeatureGrid />
          </div>
        </section>

        <TestimonialSlider />
      </main>
    </>
  )
}
