import { useParams, Link } from 'react-router-dom'

const label: Record<string, string> = { badminton: 'Badminton', pes: 'PES', 'tenis-meja': 'Tenis Meja' }

// Placeholder — form detail per lomba (Badminton/PES/Tenis Meja) akan dibangun
// pada tahap berikutnya sesuai spesifikasi masing-masing.
export default function Pendaftaran() {
  const { lomba } = useParams<{ lomba: string }>()
  const nama = (lomba && label[lomba]) ?? lomba ?? ''

  return (
    <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center px-6 text-center">
      <p className="uppercase tracking-[0.3em] text-xs text-gold font-semibold mb-4">Pendaftaran</p>
      <h1 className="font-display text-4xl font-bold mb-4">{nama}</h1>
      <p className="text-cream/60 max-w-md mb-8">
        Form pendaftaran untuk kategori ini sedang disiapkan. Ini adalah halaman placeholder,
        siap dilanjutkan ke form lengkap sesuai kebutuhan {nama}.
      </p>
      <Link to="/" className="px-6 py-3 rounded-full border border-cream/25 hover:border-cream/60 transition-colors">
        ← Kembali ke Beranda
      </Link>
    </div>
  )
}
