import { useState } from 'react'
import { Link } from 'react-router-dom'

const steps = [
  { num: '01', title: 'Know About Us', desc: "Read our literature, attend Open Days, browse our website, or speak to us directly to understand our vision and curriculum." },
  { num: '02', title: 'Apply Online', desc: "Complete the online application form on our website. All applications must be submitted online." },
  { num: '03', title: 'Test & Interview', desc: "Shortlisted applicants are invited for a written test (Arabic, Bengali, English, Qur'an, Maths) and an interview. No written test for Nursery." },
  { num: '04', title: 'Receive Offer', desc: "Successful candidates receive a formal offer letter detailing courses, fees and required documents within 5 working days." },
  { num: '05', title: 'Confirm Place', desc: "Accept the offer and pay the admission and tuition fees as outlined in the offer letter to secure your child's place." },
]

const faqs = [
  { q: 'Is An Nahl Academy a Madrasah or a School?', a: 'An Nahl Academy is a full Islamic academy combining a British-style school with a high-quality Islamic and Tahfiz curriculum. We are a Pearson Edexcel Approved Academy (Centre No. 98258).' },
  { q: "Can my child become a Ḥāfiẓ and an ʿĀlim here?", a: "Yes. Every student starts Hifzul Qur'an lessons from day one. Our structured Hifz programme runs alongside the full academic curriculum." },
  { q: 'How can you follow the British Curriculum in Bangladesh?', a: "We follow England's National Curriculum and the Pearson Edexcel syllabus. Students sit IGCSE & A-Level exams through the British Council. The academic year runs September–July/August." },
  { q: 'Will pupils receive local SSC and HSC certificates?', a: 'Our primary focus is the British Edexcel pathway. Students who wish to sit local board exams may do so as private candidates. Please discuss with our admissions office.' },
  { q: 'Can children join at any time of the year?', a: 'The academy prefers admissions at the start of each term. Late applications may be considered at the discretion of Management, though places are not guaranteed.' },
  { q: 'When does the academic year start?', a: 'The academic year starts in the first week of September and runs through to July/August, following the British academic calendar.' },
  { q: 'Do pupils receive holidays for Eid and national holidays?', a: 'Yes. Our calendar includes Eid holidays and other significant Islamic occasions alongside standard British school holidays.' },
  { q: 'Is An Nahl Academy co-educational?', a: 'An Nahl Academy maintains appropriate Islamic gender separation while providing equal educational opportunities for boys and girls.' },
]

const policies = [
  'Any child (boy or girl) who is 3+ years old can apply for our full-time and part-time courses.',
  'Parents/guardians are welcome to visit the Academy or meet the Principal by prior appointment.',
  'The Academy Year begins in the first week of September. Check the website or contact the office for the current admission window.',
  'All admission applications must be submitted online via our website.',
  'Once an application is received, the applicant will be notified of the next steps within 2 working days.',
  'A small fee applies for the application and for attending the written test / interview.',
  'Once a place is offered and accepted, admission and tuition fees paid are non-refundable.',
  'An Nahl Academy is fully committed to equal opportunity and does not discriminate against any prospective disabled applicant.',
  'Acceptance of candidates with special needs is subject to availability of appropriate resources at the Academy.',
  'The decision to accept or reject any application remains solely with the Academy Management. There is no right of appeal.',
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-white/30 bg-white/70 shadow-soft overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-brand-900 hover:bg-brand-50 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{q}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-sm text-slate-600 animate-fadeIn border-t border-slate-100">
          {a}
        </div>
      )}
    </div>
  )
}

export default function Admission() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.4),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
              Admissions are open now
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">Join An Nahl Academy</h1>
            <p className="mt-4 text-lg text-white/85">
              A unique 6-in-1 academy combining Hifzul Qur'an, Safeer Islamic curriculum and the British Edexcel programme — for children aged 3 and above.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://forms.gle/G6cZQWZuNUXGwwRE8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-base font-semibold text-brand-900 shadow-lg transition hover:bg-gold-600"
              >
                Apply Online Now →
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/20"
              >
                Contact Admissions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold text-brand-900">Admission Procedure</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Follow these five steps to secure your child's place at An Nahl Academy.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{ animationDelay: `${i * 80}ms` }}
              className="relative rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur card-hover animate-fadeIn"
            >
              <span className="text-4xl font-bold text-brand-200">{s.num}</span>
              <h3 className="mt-3 text-base font-semibold text-brand-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Test format + Contact */}
      <section className="bg-brand-50 border-t border-white/20">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-brand-900">Test & Interview Format</h2>
              <p className="mt-4 text-slate-600">The office will notify applicants of the date for the written test and interview.</p>
              <ul className="mt-6 space-y-3 text-slate-700">
                {[
                  "Written Test covers: Arabic, Bengali, English, Qur'an and Maths",
                  'No written test for Nursery applicants',
                  'Interview assesses confidence, attitude, behaviour and home culture',
                  "Parents' understanding of the curriculum, fees and policies is also evaluated",
                  'The office will update applicants on outcomes within 5 working days',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/80 p-8 shadow-soft backdrop-blur">
              <h3 className="text-xl font-semibold text-brand-900">Contact Admissions</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+8801905592130" className="hover:text-brand-700">+880 1905-592130 (Admissions)</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:official.annahlacademy@gmail.com" className="hover:text-brand-700">official.annahlacademy@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  140 Outer ByPass Road, Kolabagan Mor, Khulna 9000
                </li>
              </ul>
              <a
                href="https://forms.gle/G6cZQWZuNUXGwwRE8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand-700"
              >
                Start Application →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Policy */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold text-brand-900">Admission Policy</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Key points from our admission policy. Contact us for the complete document.</p>
        <ol className="mt-8 space-y-3">
          {policies.map((p, i) => (
            <li
              key={i}
              style={{ animationDelay: `${i * 40}ms` }}
              className="flex gap-4 rounded-2xl border border-white/30 bg-white/60 px-6 py-4 shadow-soft text-sm text-slate-700 animate-fadeIn"
            >
              <span className="shrink-0 font-bold text-brand-600">{i + 1}.</span>
              {p}
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-brand-50 border-t border-white/20">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-brand-900 text-center">Frequently Asked Questions</h2>
          <p className="mt-3 text-center text-slate-600">Everything you need to know before applying.</p>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <FAQ key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
