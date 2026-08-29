import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function NavbarSimple() {
    const { user, logout } = useAuth()

    return (
        <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-night/70 border-b border-cream/10">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logoyouthmawil.png" alt="Logo Mawil" className="h-9 w-auto" />
                    <img src="/LOGO-YFD2026.png" alt="Youth Fun Day" className="h-9 w-auto" />
                </Link>

                {user && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {user.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt={user.user_metadata?.full_name || 'Foto profil'}
                                    className="w-7 h-7 rounded-full border border-cream/20"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-xs font-semibold text-gold">
                                    {(user.email?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm text-cream/70 hidden sm:inline">
                                {user.user_metadata?.full_name || user.email}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            className="text-xs px-3 py-1.5 rounded-full border border-cream/20 text-cream/60 hover:text-cream hover:border-cream/40 transition-colors"
                        >
                            Keluar
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}