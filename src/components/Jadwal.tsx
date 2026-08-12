const jadwal = [
  {
    lomba: 'PES Football',
    tanggal: 'Minggu, 23 Agustus 2026',
    waktu: '14.00 WIB s.d Selesai',
    lokasi: 'GPIN FILIPI (Way Halim)',
    ket: 'Terbuka untuk Umum (Semua Kalangan)',
    htm: 'HTM: 25k/slot (Max 2 slot)',
  },
  {
    lomba: 'Tenis Meja',
    tanggal: 'Minggu, 23 Agustus 2026',
    waktu: '14.00 WIB s.d Selesai',
    lokasi: 'GPIN FILIPI (Way Halim)',
    ket: 'Terbuka hanya untuk Jemaat GPIN',
    htm: 'HTM: 35k/slot (Max 1 slot)',
  },
  {
    lomba: 'Badminton',
    tanggal: 'Sabtu – Minggu, 29–30 Agustus 2026',
    waktu: '14.00 WIB s.d Selesai',
    lokasi: 'GOR Badminton (Bandar Lampung)',
    ket: 'Terbuka untuk Umum (Berbagai Denominasi Gereja)',
    htm: 'HTM: 75k/Tim',
  },
]

export default function Jadwal() {
  return (
    <section id="jadwal" className="py-24 bg-night2">
      <div className="max-w-4xl mx-auto px-6">
        <p className="uppercase tracking-[0.3em] text-xs text-court font-semibold mb-4">Susunan Acara</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">Youth Fun Day GPIN 2026</h2>
        <p className="text-cream/60 mb-10">Batas Pendaftaran: 20 Agustus 2026 · CP: 0822-2570-0427</p>

        <div className="border-l border-cream/15">
          {jadwal.map((j, i) => (
            <div key={i} className="relative pl-8 pb-8 last:pb-0">
              <span className="absolute left-0 -translate-x-1/2 top-1 w-3 h-3 rounded-full bg-gold" />
              <p className="font-display text-lg text-gold mb-1">{j.lomba}</p>
              <p className="text-cream/90 text-sm">{j.tanggal}</p>
              <p className="text-cream/70 text-sm">{j.waktu} · {j.lokasi}</p>
              <p className="text-court/80 text-sm italic mt-1">{j.ket}</p>
              <p className="text-cream/60 text-xs mt-1">{j.htm}</p>
            </div>
          ))}
        </div>

        {/* Ibadah Puncak & Awards */}
        <div className="mt-12 pt-8 border-t border-cream/15 text-center">
          <p className="font-display text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet to-gold">
            Ibadah Puncak dan Awards
          </p>
          <p className="text-cream/80 mt-2">Minggu, 06 September 2026</p>
          <p className="text-cream/60 text-sm mt-1">
            GPIN Hosana — Jl. Ceremai, Beringin Raya, Kec. Kemiling, Kota Bandar Lampung
          </p>
        </div>
      </div>
    </section>
  )
}