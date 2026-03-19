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
]

export default function GalleryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-brand-900">Gallery</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Explore campus life through our curated gallery. Each snapshot highlights a different corner of the Al Nahal Academy experience.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {images.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-3xl shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
            <img
              src={item.src}
              alt={item.title}
              className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
