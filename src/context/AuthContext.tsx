// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/Supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    loginWithGoogle: (targetPath?: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const RETURN_URL_KEY = 'yfd_return_url'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession)
            setLoading(false)

            // Baru saja berhasil login → cek apakah ada halaman tujuan yang ditunda
            if (event === 'SIGNED_IN') {
                const returnUrl = sessionStorage.getItem(RETURN_URL_KEY)
                if (returnUrl) {
                    sessionStorage.removeItem(RETURN_URL_KEY)
                    navigate(returnUrl, { replace: true })
                }
            }
        })

        return () => listener.subscription.unsubscribe()
    }, [navigate])

    const loginWithGoogle = async (targetPath?: string) => {
        const currentPath = targetPath || window.location.pathname + window.location.search
        sessionStorage.setItem(RETURN_URL_KEY, currentPath)

        // Redirect SELALU ke root — ini dijamin match "Site URL" di Supabase, tidak perlu wildcard rewel
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        })
        if (error) throw error
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    return (
        <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
    return ctx
}