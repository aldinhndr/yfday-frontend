import { Link } from 'react-router-dom'

export default function NavbarSimple() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-night/70 border-b border-cream/10">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logoyouthmawil.png" alt="Logo Mawil" className="h-9 w-auto" />
                    <img src="/LOGO-YFD2026.png" alt="Youth Fun Day" className="h-9 w-auto" />
                </Link>
            </div>
        </nav>
    )
}