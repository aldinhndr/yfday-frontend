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
    const { session, loginWithGoogle } = useAuth()
    const { admin, status } = useAdmin() // status & data admin sudah di-cache di AdminContext, tidak fetch ulang di sini
    const [isAuthenticating, setIsAuthenticating] = useState(false)

    const handleAdminLogin = async () => {
        try {
            setIsAuthenticating(true)
            await loginWithGoogle('/admin')
        } catch (error) {
            console.error('Login Admin Failed:', error)
            setIsAuthenticating(false)
        }
    }

    // 1. Loading
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-night flex flex-col items-center justify-center text-cream/50 gap-3">
                <div className="w-8 h-8 border-2 border-cream/20 border-t-cream rounded-full animate-spin" />
                <span className="text-sm font-medium">Memeriksa Hak Akses Admin...</span>
            </div>
        )
    }

    // 2. Belum login sama sekali
    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center px-6 text-center">
                <NavbarSimple />
                <div className="bg-night2 border border-cream/10 rounded-2xl p-8 max-w-md w-full flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xl font-bold mb-4">
                        🔒
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-2">Portal Admin YFD</h1>
                    <p className="text-cream/60 text-sm mb-6">
                        Silakan login dengan akun Google terdaftar untuk mengakses Dashboard Administrasi.
                    </p>

                    <button
                        type="button"
                        onClick={handleAdminLogin}
                        disabled={isAuthenticating}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-cream text-night font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span>{isAuthenticating ? 'Mengarahkan...' : 'Login Admin dengan Google'}</span>
                    </button>
                </div>
            </div>
        )
    }

    // 3. Sudah login tapi bukan admin
    if (status === 'forbidden' || !admin) {
        return (
            <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center px-6 text-center">
                <NavbarSimple />
                <div className="bg-night2 border border-cream/10 rounded-2xl p-8 max-w-md w-full flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-xl font-bold mb-4">
                        ✕
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-2">Akses Ditolak</h1>
                    <p className="text-cream/60 text-sm mb-6">
                        Akun Google kamu (<span className="text-cream font-medium">{session?.user.email}</span>) tidak terdaftar sebagai administrator.
                    </p>
                    <a href="/" className="px-6 py-2.5 rounded-full border border-cream/20 text-xs hover:border-cream/50 transition-colors">
                        ← Kembali ke Beranda
                    </a>
                </div>
            </div>
        )
    }

    // 4. Terverifikasi admin
    return <>{children(admin)}</>
}