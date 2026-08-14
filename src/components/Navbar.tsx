import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/admin"
            title="Portal Admin"
            className="p-2 sm:px-3 sm:py-2 rounded-full border border-cream/15 text-cream/80 hover:text-cream hover:border-gold/40 hover:bg-gold/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>🛡️</span>
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <button
            onClick={onDaftar}
            className="text-sm px-4 py-2 rounded-full bg-gold text-night font-semibold hover:scale-105 transition-transform"
          >
            Daftar
          </button>
        </div>
      </div>
    </nav>
  )
}