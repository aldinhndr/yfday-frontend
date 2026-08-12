interface FooterProps {
  onDaftar: () => void
}

export default function Footer({ onDaftar }: FooterProps) {
  return (
    <footer className="bg-night2 border-t border-cream/10 py-16">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <img src="/logoyouthmawil.png" alt="Logo Mawil" className="h-10 w-auto" />
          <img src="/LOGO-YFD2026.png" alt="Youth Fun Day" className="h-10 w-auto" />
        </div>
        <button
          onClick={onDaftar}
          className="px-7 py-3 rounded-full bg-violet text-cream font-display font-semibold hover:scale-105 transition-transform"
        >
          Daftar Lomba
        </button>
      </div>
      <p className="text-center text-cream/30 text-xs mt-10">© 2026 GPIN Lampung. Semua hak dilindungi.</p>
    </footer>
  )
}