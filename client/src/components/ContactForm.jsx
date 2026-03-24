import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' })
      return
    }

    setStatus({ type: 'success', message: 'Thanks for reaching out! We will respond soon.' })
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/20 bg-white/70 p-8 shadow-soft backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-900">Get in touch</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Send us a message and our team will get back to you within 1-2 business days.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-gold-100 px-4 py-2 text-sm font-semibold text-gold-800">
          <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-gold-500" />
          Ready to start?
        </span>
      </div>

      {status.message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={form.name}
            onChange={handleChange('name')}
            title="Enter your full name"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            title="Enter your email address"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Message</span>
        <textarea
          value={form.message}
          onChange={handleChange('message')}
          rows={5}
          title="Write your message"
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="Tell us a bit about your inquiry"
        />
      </label>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          We respect your privacy. Your information will not be shared.
        </p>
        <button
          type="submit"
          title="Submit contact form"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
