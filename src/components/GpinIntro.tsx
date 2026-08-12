import { GPIN_CHURCHES } from '../constants.ts'

export default function GpinIntro() {
  return (
    <section id="gpin" className="relative bg-night2 py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-violet font-semibold mb-4">Tentang Kami</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">Apa itu GPIN?</h2>
          <p className="text-cream/70 leading-relaxed">
            GPIN (Gereja Protestan Injili Nusantara) adalah jaringan gereja dengan pusat pelayanan di
            Palembang, yang telah berkembang ke berbagai kota — termasuk Lampung. Youth Fun Day
            lahir dari kerinduan pemuda-pemudi GPIN Lampung untuk merayakan kebersamaan lewat
            olahraga dan permainan, sekaligus membuka pintu persahabatan dengan teman-teman umum
            di luar jemaat.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-cream/50 mb-4">GPIN di Lampung</p>
          <ul className="space-y-3">
            {GPIN_CHURCHES.map((g) => (
              <li key={g} className="flex items-center gap-3 border-b border-cream/10 pb-3">
                <span className="w-2 h-2 rounded-full bg-court" />
                <span className="text-cream/85">{g}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-cream/40">Pusat pelayanan GPIN berkedudukan di Palembang.</p>
        </div>
      </div>
    </section>
  )
}
