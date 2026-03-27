import { useEffect, useMemo, useState } from 'react'

const testimonials = [
  {
    id: 't1',
    name: 'Molla Polash Ahmed',
    role: 'Parent of Talha',
    quote:
      'An-Nahl Academy has a good intention to build up young children like my son, as my dream. Talha enjoys his academic time. He is very social and friendly.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't2',
    name: 'Shernaz Habib',
    role: 'Parent of Tanaz Masud (Year 5G)',
    quote:
      "Alhamdulillah. I am very optimistic. Through An-Nahl Academy, they opened my door to think, by Allah Subhanahu wa Ta'ala.",
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't3',
    name: 'Shajedul Hasan',
    role: 'Parent of Fatiha Binte Hasan Nuha (Year 5G)',
    quote:
      'It is very clear that studying at An-Nahl Academy is a matter of great encouragement and joy for her.',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't4',
    name: 'Khaliduzzaman',
    role: 'Parent of Humaira Zaman (Year 5G)',
    quote:
      'An-Nahl Academy is helping me in fulfilling my dream, and we are getting the help from all the teachers. We are hopeful. This kind of academy we were seeking for a long time, and Allah has given it to us. Thank you all.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't5',
    name: 'Asmaul Husna',
    role: 'Mother of Yana Binte Kaosar (Nursery)',
    quote:
      'My wish was to make my child a Hafiz, and I also wished for her to study in an English medium school. However, combining these two wishes was very difficult, which, with the help of An-Nahl Academy, I have been able to do. Alhamdulillah.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't6',
    name: 'MD Mostofa Kamal',
    role: 'Father of Ausaf',
    quote:
      'He likes An-Nahl Academy. He quite enjoys the other activities.',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't7',
    name: 'MD Moniruzzaman',
    role: 'Father of Sharif Wasif (Nursery)',
    quote:
      'All praises to Allah. We feel very comfortable that we are with a great Islamic scholar, Dr. Abul Kalam Azad, who is very prominent in home and abroad. This will give my child confidence to know all his skills, Islamic skills, from his academy.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't8',
    name: 'Dr. Kazi Shamim Parvez',
    role: 'Father of Fahmid (Year 1)',
    quote:
      'Although it has not been long since he joined An-Nahl Academy, the academy\'s activities are making us hopeful. They are trying to build up their students to be suitable for the modern era through an innovative educational system.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't9',
    name: 'Shahana Akhter',
    role: 'Parent of Abdur Rahman (Year 4B)',
    quote:
      'My child often talks about why he wasn\'t admitted to An-Nahl Academy right at the beginning of his student life. He considers the academy a part of his life.',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 't10',
    name: 'Hasibur Rahman',
    role: 'Father of Tahmid Chowdhury (Year 4B)',
    quote:
      'Our son has been attending An-Nahl Academy for five months. While it\'s still early to make a full assessment, we are pleased with the progress so far. The school provides a strong Islamic environment and is helping him grow both academically and spiritually.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
