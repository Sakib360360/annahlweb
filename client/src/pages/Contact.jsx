import ContactForm from '../components/ContactForm'

export default function Contact() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(29,162,109,0.2),transparent_65%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl font-semibold text-brand-900 md:text-5xl">Get in touch</h1>
              <p className="mt-4 max-w-xl text-lg text-slate-700">
                Our admissions team is happy to answer your questions about programs, admissions, and student life at Al Nahal Academy.
              </p>
              <div className="mt-10 space-y-5">
                <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur">
                  <h2 className="text-lg font-semibold text-brand-900">Visit us</h2>
                  <p className="mt-2 text-slate-600">123 Academy Lane, Khulna, Bangladesh</p>
                  <p className="mt-1 text-slate-600">Mon – Fri, 9:00 AM – 5:00 PM</p>
                </div>
                <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur">
                  <h2 className="text-lg font-semibold text-brand-900">Call or email</h2>
                  <p className="mt-2 text-slate-600">Phone: +88 01234 567890</p>
                  <p className="mt-1 text-slate-600">Email: info@annahlacademy.edu</p>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}
