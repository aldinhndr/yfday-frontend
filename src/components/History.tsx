import { useEffect, useState } from 'react'
import img1 from '../assets/history/yfd-2025-01.jpg'
import img2 from '../assets/history/yfd-2025-02.jpg'
import img3 from '../assets/history/yfd-2025-03.jpg'
import img4 from '../assets/history/yfd-2025-04.jpg'
import img5 from '../assets/history/yfd-2025-05.jpg'

const galeri = [img1, img2, img3, img4, img5]

const stats = [
  { angka: '120+', label: 'Peserta 2025' },
  { angka: '3', label: 'Cabang Lomba' },
  { angka: '8', label: 'Gereja Berpartisipasi' },
]

export default function History() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Navigasi keyboard di lightbox: Esc close, panah kiri/kanan pindah foto
  useEffect(() => {
    if (activeIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i === null ? i : (i + 1) % galeri.length))
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i === null ? i : (i - 1 + galeri.length) % galeri.length))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex])

  return (
    <section id="histori" className="py-24 bg-night">
      <div className="max-w-6xl mx-auto px-6">

        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">Youth Fun Day 2025</h2>
        <p className="text-cream/70 max-w-2xl leading-relaxed mb-10">
          Tahun lalu, YFD pertama kali digelar dan disambut antusias oleh pemuda-pemudi GPIN
          maupun teman-teman dari luar gereja. Lomba Badminton jadi yang paling ramai, sementara
          final PES berlangsung sampai adu penalti dramatis. Tahun ini, kita buat lebih besar lagi.
        </p>

        {/* Gallery Grid — bento style, klik untuk lightbox */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 mb-12 h-[420px]">
          {galeri.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Lihat foto YFD 2025 nomor ${i + 1}`}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2
                ${i === 0 ? 'col-span-2 row-span-2' : i === 1 ? 'col-span-2' : ''}`}
            >
              <img
                src={src}
                alt={`Dokumentasi Youth Fun Day 2025 - foto ${i + 1}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
              {i === galeri.length - 1 && (
                <div className="absolute inset-0 bg-night/50 flex items-center justify-center text-cream/90 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Semua
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeri foto Youth Fun Day 2025"
          className="fixed inset-0 z-[100] bg-night/95 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setActiveIndex(null)}
        >
          <button
            onClick={() => setActiveIndex(null)}
            aria-label="Tutup galeri"
            className="absolute top-6 right-6 w-10 h-10 rounded-full border border-cream/20 hover:bg-cream/10 transition-colors cursor-pointer"
          >
            ✕
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + galeri.length) % galeri.length) }}
            aria-label="Foto sebelumnya"
            className="absolute left-4 sm:left-8 w-11 h-11 rounded-full border border-cream/20 hover:bg-cream/10 transition-colors cursor-pointer"
          >
            ‹
          </button>

          <img
            src={galeri[activeIndex]}
            alt={`Dokumentasi Youth Fun Day 2025 - foto ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
          />

          <button
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % galeri.length) }}
            aria-label="Foto berikutnya"
            className="absolute right-4 sm:right-8 w-11 h-11 rounded-full border border-cream/20 hover:bg-cream/10 transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>
      )}
    </section>
  )
}