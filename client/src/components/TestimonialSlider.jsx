import { useEffect, useMemo, useState } from 'react'

const testimonials = [
  {
    id: 't1',
    name: 'Hassan Ahmed',
    role: 'Parent',
    quote:
      'Al Nahal Academy gave my daughter a strong foundation in both academics and faith. The teachers are incredibly supportive.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't2',
    name: 'Nadia Rahman',
    role: 'Teacher',
    quote:
      'The blend of Islamic values and the British curriculum makes this a unique place to teach, and I love the school culture.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't3',
    name: 'Aminul Islam',
    role: 'Student',
    quote:
      'The classrooms are modern, and the teachers help me learn in a friendly way. I feel confident about my exams.',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
]

export default function TestimonialSlider() {
  const [index, setIndex] = useState(0)

  const testimonial = useMemo(() => testimonials[index], [index])

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 7500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-brand-900">What our community says</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Hear directly from parents, teachers, and students about their experience learning at Al Nahal Academy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/40 text-brand-900 shadow-sm transition hover:bg-white"
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/40 text-brand-900 shadow-sm transition hover:bg-white"
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="h-24 w-24 rounded-2xl object-cover shadow-lg"
          />
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-slate-700">“{testimonial.quote}”</p>
            <div>
              <p className="font-semibold text-brand-900">{testimonial.name}</p>
              <p className="text-sm text-slate-600">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
