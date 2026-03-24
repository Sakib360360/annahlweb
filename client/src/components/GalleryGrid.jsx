import { useState, useEffect, useCallback } from 'react'

const images = [
  {
    id: 'g1',
    title: 'Library & Reading Room',
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g2',
    title: 'Modern Science Lab',
    src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g3',
    title: 'Classroom Collaboration',
    src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g4',
    title: 'Sports & Activities',
    src: 'https://images.unsplash.com/photo-1532619675605-ec32b722a11c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g5',
    title: 'Digital Learning',
    src: 'https://images.unsplash.com/photo-1581090466331-20108c4515b8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g6',
    title: 'Cultural Events',
    src: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g7',
    title: "Qur'an & Islamic Studies",
    src: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g8',
    title: 'Student Graduation',
    src: 'https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g9',
    title: 'Art & Creativity',
    src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
  },
]

function Lightbox({ index, onClose, onPrev, onNext, onJump }) {
  const item = images[index]
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1 text-sm font-medium text-white">
        {index + 1} / {images.length}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/55 text-white shadow-lg hover:bg-black/70 transition"
        aria-label="Close"
      >
        <span className="text-2xl leading-none">×</span>
      </button>

      <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-4 py-20" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onPrev}
          className="mr-3 hidden sm:inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/60 text-white shadow-lg hover:bg-black/75 transition text-3xl"
          aria-label="Previous image"
        >
          ‹
        </button>

        <div className="w-full max-w-4xl">
          <img
            key={item.id}
            src={item.src}
            alt={item.title}
            className="mx-auto max-h-[68vh] w-full rounded-2xl object-contain shadow-2xl animate-fadeIn"
          />
          <p className="mt-3 text-center text-sm font-semibold text-white/80">{item.title}</p>

          <div className="mt-4 flex items-center justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={onPrev}
              className="rounded-lg border border-white/30 bg-black/60 px-4 py-2 text-sm font-semibold text-white hover:bg-black/75 transition"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-white/30 bg-black/60 px-4 py-2 text-sm font-semibold text-white hover:bg-black/75 transition"
            >
              Next
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="ml-3 hidden sm:inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/60 text-white shadow-lg hover:bg-black/75 transition text-3xl"
          aria-label="Next image"
        >
          ›
        </button>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onJump(i)
            }}
            className={`inline-block rounded-full transition-all duration-300 ${i === index ? 'w-6 h-2 bg-gold-400' : 'w-2 h-2 bg-white/45 hover:bg-white/70'}`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function GalleryGrid() {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const openLightbox = useCallback((i) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => setLightboxIndex((i) => (i - 1 + images.length) % images.length), [])
  const nextImage = useCallback(() => setLightboxIndex((i) => (i + 1) % images.length), [])
  const jumpImage = useCallback((i) => setLightboxIndex(i), [])

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl font-semibold text-brand-900">Campus Gallery</h1>
          <p className="mt-3 mx-auto max-w-2xl text-slate-600">Explore campus life at An Nahl Academy. Click any image to zoom in and browse with arrows or keyboard.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(i)}
              style={{ animationDelay: `${i * 55}ms` }}
              className="group relative overflow-hidden rounded-3xl shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow focus:outline-none focus:ring-4 focus:ring-brand-300 cursor-zoom-in text-left animate-fadeIn"
              aria-label={`View ${item.title}`}
            >
              <img src={item.src} alt={item.title} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="6" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m-2-4H9m4-4v8"/></svg>
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
                <p className="text-sm font-semibold text-white drop-shadow">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {lightboxIndex !== null && (
        <Lightbox index={lightboxIndex} onClose={closeLightbox} onPrev={prevImage} onNext={nextImage} onJump={jumpImage} />
      )}
    </>
  )
}
