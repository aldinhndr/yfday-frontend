import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface AdminInfo {
    id: string
    email: string
    role: string
}

type AdminStatus = 'loading' | 'unauthenticated' | 'forbidden' | 'ok'

interface AdminContextType {
    admin: AdminInfo | null
    status: AdminStatus
    refetch: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
    const { session, loading: authLoading } = useAuth()
    const [admin, setAdmin] = useState<AdminInfo | null>(null)
    const [status, setStatus] = useState<AdminStatus>('loading')

    const checkedTokenRef = useRef<string | null>(null)

    const runCheck = async () => {
        if (!session?.access_token) {
            setStatus('unauthenticated')
            return
        }

        checkedTokenRef.current = session.access_token
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/me`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            if (!res.ok) throw new Error('forbidden')
            const data = await res.json()
            setAdmin(data)
            setStatus('ok')
        } catch {
            setAdmin(null)
            setStatus('forbidden')
        }
    }

    useEffect(() => {
        if (authLoading) return

        if (!session?.access_token) {
            checkedTokenRef.current = null
            setAdmin(null)
            setStatus('unauthenticated')
            return
        }
        if (checkedTokenRef.current === session.access_token && status !== 'loading') {
            return
        }

        setStatus('loading')
        runCheck()
    }, [session, authLoading])

    return (
        <AdminContext.Provider value={{ admin, status, refetch: runCheck }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    const ctx = useContext(AdminContext)
    if (!ctx) throw new Error('useAdmin harus dipakai di dalam AdminProvider')
    return ctx
}