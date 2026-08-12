import ThreeBackground from './ThreeBackground.tsx'
import posterYFD from '../assets/poster-yfd.jpg'

interface HeroProps {
  onDaftar: () => void
}

export default function Hero({ onDaftar }: HeroProps) {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-night via-night2 to-night" />
      <ThreeBackground />
      <div className="grain absolute inset-0" />
      {/* vignette biar fokus ke tengah, kesan lebih sinematik */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,15,0.5)_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Teks */}
        <div>
          <img
            src="/LOGO-YFD2026.png"
            alt="Youth Fun Day 2026"
            className="w-full max-w-[200px] sm:max-w-xs"
          />

          <p className="mt-6 text-cream/70 max-w-md text-base sm:text-lg leading-relaxed">
            Satu momentum, tiga arena, satu semangat pemuda. Tenis Meja, PES, dan Badminton —
            bertanding, ketemu sahabat baru, rayakan sukacita bareng.
          </p>

          <div className="mt-8 scoreline w-full max-w-sm" />

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onDaftar}
              className="group relative px-8 py-3.5 rounded-full bg-gold text-night font-display font-semibold
                         shadow-[0_0_0_0_rgba(255,193,69,0.5)] hover:shadow-[0_0_35px_2px_rgba(255,193,69,0.45)]
                         hover:scale-[1.04] active:scale-[0.98] transition-all duration-300"
            >
              <span className="relative z-10">Daftar Sekarang</span>
            </button>
            <a
              href="#lomba"
              className="px-8 py-3.5 rounded-full border border-cream/20 hover:border-cream/50 hover:bg-cream/5 transition-all duration-300"
            >
              Lihat 3 Lomba
            </a>
          </div>

          {/* Quick info strip */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-cream/50">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-court" /> 23 Agt – 6 Sep 2026
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-violet" /> Bandar Lampung
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gold" /> 3 Cabang Lomba
            </span>
          </div>
        </div>

        {/* Poster 4:5 */}
        <div className="relative mx-auto w-full max-w-xs">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-cream/10
                          shadow-[0_0_70px_-12px_rgba(124,92,252,0.55)]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet/30 via-night2 to-gold/20" />
            <img
              src={posterYFD}
              alt="Poster Youth Fun Day 2026"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/50 via-transparent to-transparent" />
          </div>

          {/* floating badge — kesan premium/dynamic */}
          <div className="absolute -bottom-5 -left-5 px-4 py-2.5 rounded-xl bg-night2/90 backdrop-blur-md
                          border border-cream/10 shadow-xl">
            <p className="text-[10px] uppercase tracking-wider text-cream/50">Pendaftaran Ditutup</p>
            <p className="font-display font-bold text-gold text-sm">20 Agustus 2026</p>
          </div>
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br from-violet to-gold
                          flex items-center justify-center font-display font-bold text-night text-sm shadow-xl">
            2026
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40 motion-reduce:hidden">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <span className="w-px h-8 bg-gradient-to-b from-cream/40 to-transparent animate-bounce" />
      </div>

      {/* Fade transisi ke section berikutnya — biar tidak ada garis batas keras */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night2 pointer-events-none" />
    </section >
  )
}