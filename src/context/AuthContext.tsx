// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/Supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    loginWithGoogle: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch session awal
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        }).catch((err) => {
            console.error('Error fetching initial auth session:', err)
            setLoading(false)
        })

        // Listener perubahan status otentikasi (login, logout, token refreshed)
        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setLoading(false)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    const loginWithGoogle = async () => {
        try {
            // Gunakan window.location.origin agar redirect URI selalu bersih ke domain utama
            const redirectUrl = `${window.location.origin}`

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) throw error
        } catch (error) {
            console.error('Google OAuth Login failed:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Logout failed:', error)
            throw error
        }
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