const lombaList = [
  {
    key: 'tenis-meja',
    nama: 'Tenis Meja',
    tag: 'Internal GPIN',
    color: 'court',
    desc: 'Khusus jemaat GPIN. Isi form pendaftaran singkat dan unggah bukti pembayaran.',
    info: ['HTM Rp35.000 / slot', 'Peserta perorangan', 'Sistem gugur'],
  },
  {
    key: 'pes',
    nama: 'PES CONSOLE PS3/PS4',
    tag: 'Umum, Bebas',
    color: 'gold',
    desc: 'Terbuka untuk semua kalangan. Satu orang boleh ambil maksimal 2 slot.',
    info: ['HTM Rp25.000 / slot', 'Maks. 2 slot / orang'],
  },
  {
    key: 'badminton',
    nama: 'Badminton',
    tag: 'Ganda Putra / Putri / Campuran',
    color: 'violet',
    desc: 'Bertanding sebagai tim ganda. Pendaftaran perlu surat pengantar gereja.',
    info: ['HTM Rp75.000 / tim', 'Perlu surat gereja', '3 kategori ganda'],
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  court: { bg: 'bg-court/10', text: 'text-court', border: 'border-court/30' },
  gold: { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/30' },
  violet: { bg: 'bg-violet/10', text: 'text-violet', border: 'border-violet/30' },
}

interface LombaSectionProps {
  onPilihLomba: (lombaKey: string) => void
}

export default function LombaSection({ onPilihLomba }: LombaSectionProps) {
  return (
    <section id="lomba" className="py-24 bg-night">
      <div className="max-w-6xl mx-auto px-6">
        <p className="uppercase tracking-[0.3em] text-xs text-gold font-semibold mb-4">3 Arena</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-12">Pilih Lomba Kamu</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {lombaList.map((l) => {
            const c = colorMap[l.color]
            return (
              <button
                key={l.key}
                onClick={() => onPilihLomba(l.key)}
                className={`text-left ticket-notch rounded-2xl border ${c.border} ${c.bg} p-6 flex flex-col justify-between h-full hover:-translate-y-1 transition-transform`}
              >
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>{l.tag}</span>
                  <h3 className="font-display text-2xl font-bold mt-2 mb-3">{l.nama}</h3>
                  <p className="text-cream/65 text-sm">{l.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {l.info.map((i) => (
                      <li key={i} className="text-xs text-cream/50 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.text.replace('text', 'bg')}`} />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className={`mt-6 inline-flex items-center gap-1 text-sm font-semibold ${c.text}`}>
                  Daftar lomba ini →
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
