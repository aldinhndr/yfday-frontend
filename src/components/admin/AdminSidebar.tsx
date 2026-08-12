import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ThemeToggle'
import {
    LayoutDashboard, Gamepad2, Trophy, CircleDot, Wallet,
    LogOut, Menu, X,
} from 'lucide-react'

export type AdminSection = 'overview' | 'pes' | 'badminton' | 'tenis' | 'keuangan'

interface NavItem {
    key: AdminSection
    label: string
    icon: typeof LayoutDashboard
    roles: string[] // role yang boleh lihat menu ini
}

const NAV_ITEMS: NavItem[] = [
    { key: 'overview', label: 'Ringkasan', icon: LayoutDashboard, roles: ['super_admin', 'bendahara', 'admin_pes', 'admin_badminton', 'admin_tenis_meja'] },
    { key: 'pes', label: 'PES', icon: Gamepad2, roles: ['super_admin', 'bendahara', 'admin_pes'] },
    { key: 'badminton', label: 'Badminton', icon: Trophy, roles: ['super_admin', 'bendahara', 'admin_badminton'] },
    { key: 'tenis', label: 'Tenis Meja', icon: CircleDot, roles: ['super_admin', 'bendahara', 'admin_tenis_meja'] },
    { key: 'keuangan', label: 'Keuangan', icon: Wallet, roles: ['super_admin', 'bendahara'] },
]

const ROLE_LABEL: Record<string, string> = {
    super_admin: 'Super Admin',
    admin_pes: 'Admin PES',
    admin_badminton: 'Admin Badminton',
    admin_tenis_meja: 'Admin Tenis Meja',
    bendahara: 'Bendahara',
}

interface AdminSidebarProps {
    role: string
    email: string
    active: AdminSection
    onChange: (section: AdminSection) => void
}

function initialsFromEmail(email: string) {
    const name = email.split('@')[0]
    return name.slice(0, 2).toUpperCase()
}

export default function AdminSidebar({ role, email, active, onChange }: AdminSidebarProps) {
    const { logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const items = NAV_ITEMS.filter((i) => i.roles.includes(role))

    const content = (
        <>
            {/* Brand */}
            <div className="px-5 pt-6 pb-5">
                <div className="flex items-center gap-2.5">
                    <img src="/logoyouthmawil.png" alt="Logo Mawil" className="h-7 w-auto" />
                    <div className="w-px h-6 bg-cream/15" />
                    <img src="/LOGO-YFD2026.png" alt="YFD" className="h-7 w-auto" />
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/35">
                    Admin Panel
                </p>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = active === item.key
                    return (
                        <button
                            key={item.key}
                            onClick={() => { onChange(item.key); setMobileOpen(false) }}
                            className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 text-left group
                ${isActive
                                    ? 'bg-gold/10 text-gold'
                                    : 'text-cream/55 hover:text-cream hover:bg-cream/[0.04]'}`}
                        >
                            {/* accent bar kiri, cuma muncul saat aktif */}
                            <span
                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gold transition-all duration-200
                  ${isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'}`}
                            />
                            <Icon
                                size={18}
                                strokeWidth={isActive ? 2.2 : 1.8}
                                className={isActive ? 'text-gold' : 'text-cream/40 group-hover:text-cream/70'}
                            />
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            {/* Profile & actions */}
            <div className="px-4 py-4 mt-2 border-t border-cream/10">
                <div className="flex items-center gap-3 px-1 py-2">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-violet to-gold flex items-center justify-center text-night text-xs font-bold">
                        {initialsFromEmail(email)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-cream truncate leading-tight">{email}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wide text-gold/90">
                            {ROLE_LABEL[role] || role}
                        </span>
                    </div>
                    <ThemeToggle />
                </div>
                <button
                    onClick={logout}
                    className="mt-2 w-full flex items-center justify-center gap-2 text-xs px-3 py-2.5 rounded-xl
                     border border-cream/10 text-cream/50 hover:text-cream hover:border-cream/25 hover:bg-cream/[0.03]
                     transition-colors"
                >
                    <LogOut size={14} strokeWidth={1.8} />
                    Keluar
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-night2/95 backdrop-blur-xl border-r border-cream/10 z-40">
                {content}
            </aside>

            {/* Mobile topbar */}
            <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-night2/95 backdrop-blur-xl border-b border-cream/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <img src="/logoyouthmawil.png" alt="Logo Mawil" className="h-7 w-auto" />
                    <img src="/LOGO-YFD2026.png" alt="YFD" className="h-7 w-auto" />
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    aria-label="Buka menu admin"
                    className="w-9 h-9 rounded-lg border border-cream/15 flex items-center justify-center text-cream/70"
                >
                    <Menu size={18} strokeWidth={1.8} />
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-night/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-72 bg-night2 border-r border-cream/10 flex flex-col h-full">
                        <button
                            onClick={() => setMobileOpen(false)}
                            aria-label="Tutup menu"
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-cream/15 flex items-center justify-center text-cream/60"
                        >
                            <X size={16} strokeWidth={1.8} />
                        </button>
                        {content}
                    </aside>
                </div>
            )}
        </>
    )
}