// src/components/RequireAdmin.tsx
import { type ReactNode, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAdmin } from '../context/AdminContext'
import NavbarSimple from './NavbarLogo'

interface AdminUser {
    id: string
    email: string
    role: string
}

interface RequireAdminProps {
    children: (admin: AdminUser) => ReactNode
}

export default function RequireAdmin({ children }: RequireAdminProps) {
    const { session, loginWithGoogle, logout } = useAuth()
    const { admin, status } = useAdmin()
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleAdminLogin = async () => {
        try {
            setIsAuthenticating(true)
            await loginWithGoogle('/admin')
        } catch (error) {
            console.error('Login Admin Failed:', error)
            setIsAuthenticating(false)
        }
    }

    // Handler Switch Account jika email salah/bukan admin
    const handleSwitchAccount = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
            // Reset ke flow login admin
            window.location.reload()
        } catch (error) {
            console.error('Logout failed:', error)
            setIsLoggingOut(false)
        }
    }

    // 1. Loading State
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-night flex flex-col items-center justify-center text-cream/50 gap-3">
                <div className="w-8 h-8 border-2 border-cream/20 border-t-cream rounded-full animate-spin" />
                <span className="text-sm font-medium">Memeriksa Hak Akses Admin...</span>
            </div>
        )
    }

    // 2. Belum login sama sekali (Tampilkan Portal Gerbang Login)
    if (status === 'unauthenticated' || !session) {
        return (
            <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center px-6 text-center">
                <NavbarSimple />
                <div className="bg-night2 border border-cream/10 rounded-3xl p-8 max-w-md w-full flex flex-col items-center shadow-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold border border-gold/20 flex items-center justify-center text-2xl mb-5">
                        🛡️
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-2">Portal Administrasi YFD</h1>
                    <p className="text-cream/60 text-sm mb-6 leading-relaxed">
                        Silakan autentikasi menggunakan akun Google terdaftar untuk mengakses panel dashboard.
                    </p>

                    <button
                        type="button"
                        onClick={handleAdminLogin}
                        disabled={isAuthenticating}
                        className="w-full flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl bg-cream text-night font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                    >
                        {isAuthenticating ? (
                            <div className="w-5 h-5 border-2 border-night/20 border-t-night rounded-full animate-spin" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>{isAuthenticating ? 'Mengarahkan ke Google...' : 'Masuk Portal via Google'}</span>
                    </button>

                    <div className="mt-8 pt-6 border-t border-cream/10 w-full">
                        <a href="/" className="text-cream/40 hover:text-cream text-xs font-medium transition-colors">
                            ← Kembali ke Beranda
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // 3. Sudah login tapi bukan admin (Akses Ditolak + Opsi Ganti Akun)
    if (status === 'forbidden' || !admin) {
        return (
            <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center px-6 text-center">
                <NavbarSimple />
                <div className="bg-night2 border border-red-500/20 rounded-3xl p-8 max-w-md w-full flex flex-col items-center shadow-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center text-2xl font-bold mb-4">
                        ✕
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-2">Akses Ditolak</h1>
                    <p className="text-cream/60 text-sm mb-6 leading-relaxed">
                        Akun <span className="text-cream font-medium underline">{session?.user.email}</span> tidak terdaftar sebagai panitia/administrator.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            type="button"
                            onClick={handleSwitchAccount}
                            disabled={isLoggingOut}
                            className="w-full py-3.5 rounded-2xl bg-cream text-night text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                        >
                            {isLoggingOut ? 'Mengeluarkan sesi...' : '🔄 Ganti Akun Google'}
                        </button>
                        <a
                            href="/"
                            className="w-full py-3 rounded-2xl border border-cream/15 text-cream/70 text-xs hover:border-cream/40 transition-colors text-center"
                        >
                            ← Kembali ke Beranda
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // 4. Terverifikasi Admin
    return <>{children(admin)}</>
}