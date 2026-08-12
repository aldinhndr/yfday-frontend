const links = [
  { href: '#lomba', label: 'Lomba' },
  { href: '#jadwal', label: 'Jadwal' },
  { href: '#histori', label: 'Histori' },
  { href: '#gpin', label: 'GPIN' },
]

interface NavbarProps {
  onDaftar: () => void
}

export default function Navbar({ onDaftar }: NavbarProps) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-night/70 border-b border-cream/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src="/logoyouthmawil.png" alt="Logo Mawil" className="h-9 w-auto" />
          <img src="/LOGO-YFD2026.png" alt="Youth Fun Day" className="h-9 w-auto" />
        </a>
        <div className="hidden sm:flex items-center gap-8 text-sm text-cream/70">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-cream transition-colors">{l.label}</a>
          ))}
        </div>
        <button
          onClick={onDaftar}
          className="text-sm px-4 py-2 rounded-full bg-gold text-night font-semibold hover:scale-105 transition-transform"
        >
          Daftar
        </button>
      </div>
    </nav>
  )
}