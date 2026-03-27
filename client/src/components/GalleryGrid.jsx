import { useState, useEffect, useCallback } from 'react'

const images = [
  {
    id: 'g1',
    title: 'Campus Gallery Image 1',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/644588828_122191228640520865_2939741443596016147_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeGIDb882EXt4riGe87rdt8701XVNlxao0LTVdU2XFqjQi1CI5Bcm-BMCrrA3CVUevwSezSgTQfqCOYPUL8CK2x-&_nc_ohc=OtJcRJyEE4kQ7kNvwFIQaRc&_nc_oc=AdrujTW77_NoPClNco1R3D8RKchzV_02ELP7X6nGSWSTOOLRubPE-vQJQnPtQ065Uf4&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=OKSFeMwtGs-rqo6L-O0Nfw&_nc_ss=7a32e&oh=00_Afzj585bkAlTGrpt2l_Qyju2KRgv_O_dEiMr2YuOyfS-ow&oe=69CAF627',
  },
  {
    id: 'g2',
    title: 'Campus Gallery Image 2',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/615772079_122185520516520865_1878175827036753484_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeFa9k6bpJuyaKuBP3E83kNRDpzfBOf5XLIOnN8E5_lcssxMymT5rJZ2rg68WoCd-9u8SHbT5UgFxBp_GgjC8oXX&_nc_ohc=E1Z3ZB8s7WIQ7kNvwGoJnSw&_nc_oc=AdqlxLnwaCX3EmTeASRnDOR2xd6BQh8ZPWReO5a8uq2heqlsvIJZCzje0893o1XULiY&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=KGHRcSrXqmvXD_IVXH5YVQ&_nc_ss=7a32e&oh=00_AfxTfueqrKi8L5OoudzqYz_BNu8cSRjgiY3dnMg9SKMZnQ&oe=69CB24DE',
  },
  {
    id: 'g3',
    title: 'Campus Gallery Image 3',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/615084161_122185520564520865_7037250176128573110_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeHECheiYnbUKQSBlEQMSID6oHLqs7c-zHugcuqztz7Me523AbrpzykVxCra5cuM33z8iKl_QwzFXNcSK12nz3Ff&_nc_ohc=U3iB4hYwrr8Q7kNvwGfAk3z&_nc_oc=AdoZItZ7v_Rub9GxM6qBwOM4V4TSH9ZZLOMGWnt-5TH0NwV8UEPpjUQdmKctbzOSOZM&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=jJOWW5zjiMVGzT8jJozEZg&_nc_ss=7a32e&oh=00_Afy-6ncB5cSFT7koVXMomfnYrhhTIsxUw-PqJe-jicwEFA&oe=69CB133B',
  },
  {
    id: 'g4',
    title: 'Campus Gallery Image 4',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/616069421_122185520270520865_264859890587980087_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeFvWkPNGlvSs6tKzCI12UA57Jf4aYwafpjsl_hpjBp-mHawWTdQiivJ2xlnJYIwo5D4jJR4aPdaWiLyt9Wd_Mdz&_nc_ohc=FsQK3At_JXgQ7kNvwHFAjTR&_nc_oc=AdociXPkKseK_xCiKbAH5He8Qy-G_gcSwXvsyy9yDg5LzmChJXnSy4_MO2YLVhxmKIc&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=ATzFjWrBp0Ycycls3C1FFg&_nc_ss=7a32e&oh=00_AfzFfpzf4VePG0Zc4-28wDBdWT1XB1LBwBtrE80ga_GmVQ&oe=69CB263B',
  },
  {
    id: 'g5',
    title: 'Campus Gallery Image 5',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/615271086_122185519412520865_5298108699696072829_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeF4UkGAOKzBoel9fxNrjR6NCPwlh5mUsUYI_CWHmZSxRpgYuxdlu_yrVw92ds1oENTp17oGd9B0OfTrPvokoRBz&_nc_ohc=i0CGH2Eie00Q7kNvwG2VKzN&_nc_oc=AdqJrkEpqhvKPgRU6othpoUf2zM2lTt8BOAc21JjutL7Yq4oHSzROm-tVm6LppL4GOE&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=v763QqKxLxcxCKt9XGqQcw&_nc_ss=7a32e&oh=00_AfyKhEv9rGUUcxYWvk0o20y_MVtn3R0yrZtrKcehxOOIzQ&oe=69CB0E9F',
  },
  {
    id: 'g6',
    title: 'Campus Gallery Image 6',
    src: 'https://www.facebook.com/photo.php?fbid=122185519502520865&set=pb.61565625960301.-2207520000&type=3',
  },
  {
    id: 'g7',
    title: 'Campus Gallery Image 7',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/613519278_122185080854520865_3748173931223427214_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeF5L5L09d0gEXbAr5CviB5jmsseIys5dPSayx4jKzl09OEmin9Z7HLwuqTWiIUvIl01vM6W-8a3-bCfaRW28kZT&_nc_ohc=2kNU9dHP2V0Q7kNvwEjX648&_nc_oc=AdqPNpbjrE298NOsqxM9rkjoUfKxO36Z9ZIRBS1eiEeeu5hXpir1S8PCrRUx5B-I2Nw&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=KhpIXMrq6c5IkF_C1gVCaw&_nc_ss=7a32e&oh=00_Afziznv2DmnGBZkSL-biZoxmoBELoopzmulQO19SSi86Jg&oe=69CAF6AA',
  },
  {
    id: 'g8',
    title: 'Campus Gallery Image 8',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/612246323_122184862460520865_8795543333020773240_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeHPw_jUSB-WI6kKyXecfnA4_aozWeXxkUT9qjNZ5fGRRMDZ0pHNdQs3syVRBimLrStyCn_HUm9xJMar3AVJDrAV&_nc_ohc=7oMOVbzrbLYQ7kNvwFYdUOU&_nc_oc=AdpgaEH_j8TgaJtT66wK1FbYJ4TRS3gbmmoYz45aRz-TpvxlZXwZolc8Wy0rDdGFg88&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=cxfUSExrF0Rx1AgZ9H9bgw&_nc_ss=7a32e&oh=00_Afy17w1QrbKKuYyun-2kiowPe64poq0-UdSvmf6-siHIug&oe=69CB076E',
  },
  {
    id: 'g9',
    title: 'Campus Gallery Image 9',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/598883165_122181145220520865_4057731648288141299_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeHieE2tfb0dCfPyb0DVdsSExBojph95HlvEGiOmH3keW7XWGyBKAGzrqgh-XB_d8x5hy0g9xfxNFpnJJ7Ap0sn5&_nc_ohc=3oITtBWI6-QQ7kNvwGr3Nql&_nc_oc=AdqvCSlQQUMoHQDXaSUpUVa-19FKpD84KhDIYuZwTly-bwuihUvq9PQKgktlyVKB7WQ&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=Ki65UoRK-45J311e9XRn_Q&_nc_ss=7a32e&oh=00_AfyPHap24QEbuem2tc4FKL7IgkLfzggw5fTwu-zCMBJVwA&oe=69CB22D9',
  },
  {
    id: 'g10',
    title: 'Campus Gallery Image 10',
    src: 'https://scontent.fdac167-1.fna.fbcdn.net/v/t39.30808-6/597894263_122181146432520865_2509701768578473784_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeGfvrcvyuthv1EsNdNGWpM5kdJHy2x_iyaR0kfLbH-LJipfNA-BC90Kz1Zj6ztnv3U2IMZpl9n8dy-w6ZuZyRQv&_nc_ohc=yZ_wKBkXl2YQ7kNvwFR_t8V&_nc_oc=AdovNQJrFPR64mPfnYh4ZvZ4cb8bg_BCI3yEyQJoxd9K68vgx8iEouLmbl31EJoFF_Y&_nc_zt=23&_nc_ht=scontent.fdac167-1.fna&_nc_gid=HcMwCqA_oLSiBz9IL7Qy3Q&_nc_ss=7a32e&oh=00_AfzABzUz6dVh2Oys7J2ACAbjTuir4K4JDrOd13VN3tPEvQ&oe=69CB20ED',
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
