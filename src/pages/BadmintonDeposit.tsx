// src/pages/BadmintonDeposit.tsx
import { useState } from 'react'

export interface CockUsageLog {
    id: string | number
    match_id: string
    set_number: number
    opponent_name: string
    shuttlecock_qty: number
    deduction_amount: number
    created_at: string
}

export interface DepositHistoryLog {
    id: string | number
    amount: number
    notes?: string
    created_at: string
}

export interface BadmintonTeamSummary {
    team_id: string
    team_name: string
    category?: string
    player_1_name: string
    player_2_name: string
    phone_number?: string
    total_deposit: number
    total_cock_used: number
    total_cost: number
    remaining_deposit: number
    usage_logs?: CockUsageLog[]
    deposit_logs?: DepositHistoryLog[]
}

export interface MatchCockSummary {
    match_id: string
    round: string
    team_a_name: string
    team_b_name: string
    total_cocks: number
    total_cost: number
}

interface BadmintonDepositProps {
    teams?: BadmintonTeamSummary[]
    matchSummaries?: MatchCockSummary[]
    onRefresh?: () => void | Promise<void>
    token?: string
}

export default function BadmintonDeposit({
    teams = [],
    matchSummaries = [],
    onRefresh,
    token
}: BadmintonDepositProps) {
    const [search, setSearch] = useState<string>('')
    const [selectedTeam, setSelectedTeam] = useState<BadmintonTeamSummary | null>(null)
    const [topUpAmount, setTopUpAmount] = useState<number>(50000)
    const [topUpNotes, setTopUpNotes] = useState<string>('')
    const [refundAmount, setRefundAmount] = useState<number>(0)
    const [refundNotes, setRefundNotes] = useState<string>('Pencairan sisa deposit tim')
    
    // State Modal Pendaftaran Tim Baru
    const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false)
    const [newTeamName, setNewTeamName] = useState<string>('')
    const [newCategory, setNewCategory] = useState<string>('ganda_putra')
    const [newPlayer1, setNewPlayer1] = useState<string>('')
    const [newPlayer2, setNewPlayer2] = useState<string>('')
    const [newPhone, setNewPhone] = useState<string>('')
    const [newInitialDeposit, setNewInitialDeposit] = useState<number>(50000)

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [activeModalTab, setActiveModalTab] = useState<'topup' | 'refund' | 'usage_history' | 'deposit_history'>('topup')

    // Filter pencarian tim
    const filteredTeams = teams.filter((t) => {
        const q = search.toLowerCase()
        return (
            t.team_name.toLowerCase().includes(q) ||
            t.player_1_name.toLowerCase().includes(q) ||
            t.player_2_name.toLowerCase().includes(q) ||
            (t.phone_number || '').includes(q)
        )
    })

    // Hitung ringkasan statistik
    const totalDepositAll = teams.reduce((acc, t) => acc + (t.total_deposit || 0), 0)
    const totalCostAll = teams.reduce((acc, t) => acc + (t.total_cost || 0), 0)
    const totalRemainingAll = teams.reduce((acc, t) => acc + (t.remaining_deposit || 0), 0)
    const totalCocksAll = teams.reduce((acc, t) => acc + (t.total_cock_used || 0), 0)

    const handleOpenTeamDetail = (team: BadmintonTeamSummary, defaultTab: 'topup' | 'refund' = 'topup') => {
        setSelectedTeam(team)
        setActiveModalTab(defaultTab)
        setTopUpAmount(50000)
        setTopUpNotes('')
        setRefundAmount(Math.max(0, team.remaining_deposit))
        setRefundNotes('Pencairan sisa saldo deposit tim')
    }

    // Handler Pendaftaran Tim Baru
    const handleCreateTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTeamName.trim() || !newPlayer1.trim() || !newPlayer2.trim()) {
            alert('Lengkapi nama tim dan kedua nama pemain!')
            return
        }

        setIsSubmitting(true)
        try {
            const apiBase = import.meta.env.VITE_API_URL || ''
            const res = await fetch(`${apiBase}/api/badminton/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_name: newTeamName.trim(),
                    category: newCategory,
                    player_1_name: newPlayer1.trim(),
                    player_2_name: newPlayer2.trim(),
                    phone_number: newPhone.trim() || null,
                    initial_deposit: Number(newInitialDeposit) || 0
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.detail || 'Gagal mendaftarkan tim baru')
            }

            alert('✅ Tim dan setoran awal deposit berhasil didaftarkan!')
            setShowAddTeamModal(false)
            setNewTeamName('')
            setNewPlayer1('')
            setNewPlayer2('')
            setNewPhone('')
            setNewInitialDeposit(50000)
            if (onRefresh) await onRefresh()
        } catch (err: any) {
            alert(err.message || 'Terjadi kesalahan sistem')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handler Top-up Saldo Deposit
    const handleTopUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTeam) return
        if (topUpAmount <= 0) {
            alert('Nominal deposit harus lebih besar dari 0')
            return
        }

        if (!window.confirm(`Konfirmasi Top-up Deposit sebesar Rp${topUpAmount.toLocaleString('id-ID')} untuk ${selectedTeam.team_name}?`)) {
            return
        }

        setIsSubmitting(true)
        try {
            const apiBase = import.meta.env.VITE_API_URL || ''
            const res = await fetch(`${apiBase}/api/badminton/teams/${selectedTeam.team_id}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: topUpAmount,
                    notes: topUpNotes || 'Top up via Admin Meja'
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.detail || 'Gagal memproses deposit')
            }

            alert('✅ Deposit berhasil ditambahkan!')
            setSelectedTeam(null)
            if (onRefresh) await onRefresh()
        } catch (err: any) {
            alert(err.message || 'Terjadi kesalahan sistem')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handler Refund / Pengembalian Sisa Saldo
    const handleRefundSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTeam) return
        if (refundAmount <= 0) {
            alert('Nominal refund harus lebih besar dari 0')
            return
        }
        if (refundAmount > selectedTeam.remaining_deposit) {
            alert(`Nominal refund melebihi sisa saldo deposit (Sisa: Rp${selectedTeam.remaining_deposit.toLocaleString('id-ID')})`)
            return
        }

        if (!window.confirm(`Konfirmasi pencairan/refund dana sebesar Rp${refundAmount.toLocaleString('id-ID')} kepada ${selectedTeam.team_name}?`)) {
            return
        }

        setIsSubmitting(true)
        try {
            const apiBase = import.meta.env.VITE_API_URL || ''
            const res = await fetch(`${apiBase}/api/badminton/deposits/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_id: selectedTeam.team_id,
                    amount: refundAmount,
                    admin_note: refundNotes || 'Pencairan sisa saldo deposit tim'
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.detail || 'Gagal memproses refund saldo')
            }

            alert('✅ Sisa deposit berhasil dicairkan!')
            setSelectedTeam(null)
            if (onRefresh) await onRefresh()
        } catch (err: any) {
            alert(err.message || 'Terjadi kesalahan sistem')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* 1. STATS METRICS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Total Deposit Masuk</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-1">
                        Rp{totalDepositAll.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Total Biaya Kok Terpakai</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-1">
                        Rp{totalCostAll.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">({totalCocksAll} Kok Terpakai)</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Sisa Saldo Semua Tim</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 mt-1">
                        Rp{totalRemainingAll.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Total Tim Terdaftar</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white mt-1">
                        {teams.length} <span className="text-xs font-normal text-slate-400">Tim</span>
                    </div>
                </div>
            </div>

            {/* 2. RINGKASAN PEMAKAIAN KOK PER MATCH (M01 - M10) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🏸</span> Rekap Penggunaan Kok Per Match
                    </h2>
                    <p className="text-xs text-slate-400">Pencatatan shuttlecock yang dicatat langsung oleh wasit di lapangan.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {matchSummaries.length > 0 ? (
                        matchSummaries.map((m) => (
                            <div key={m.match_id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-xs font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                                        {m.match_id}
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{m.round}</span>
                                </div>
                                <div className="my-2">
                                    <div className="text-[11px] text-slate-200 font-medium truncate">{m.team_a_name}</div>
                                    <div className="text-[9px] text-slate-500 uppercase">vs</div>
                                    <div className="text-[11px] text-slate-200 font-medium truncate">{m.team_b_name}</div>
                                </div>
                                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                                    <span className="text-slate-400">Kok: <b className="text-white">{m.total_cocks}</b></span>
                                    <span className="text-amber-400 font-bold">Rp{m.total_cost.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-6 text-center text-xs font-mono text-slate-500">
                            Belum ada aktivitas match yang tercatat dari wasit.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. TABEL DATA MASTER DEPOSIT TIM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">Daftar Tim &amp; Saldo Deposit</h2>
                        <p className="text-xs text-slate-400">Kelola setoran deposit awal, penambahan saldo, audit log wasit, dan refund dana tim.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <input
                            type="text"
                            placeholder="Cari nama tim / pemain..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors w-48 sm:w-64"
                        />
                        <button
                            onClick={() => setShowAddTeamModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                            + Daftarkan Tim &amp; Deposit
                        </button>
                        {onRefresh && (
                            <button
                                onClick={() => onRefresh()}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                                title="Refresh Data"
                            >
                                🔄
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                            <tr>
                                <th className="py-3.5 px-4">Nama Tim &amp; Pemain</th>
                                <th className="py-3.5 px-4">Total Deposit</th>
                                <th className="py-3.5 px-4 text-center">Kok Terpakai</th>
                                <th className="py-3.5 px-4">Biaya Kok (@5K)</th>
                                <th className="py-3.5 px-4">Sisa Saldo</th>
                                <th className="py-3.5 px-4 text-center">Aksi Meja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredTeams.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                                        Tidak ada data tim yang sesuai dengan pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredTeams.map((t) => {
                                    const isLow = t.remaining_deposit < 20000
                                    return (
                                        <tr
                                            key={t.team_id}
                                            onClick={() => handleOpenTeamDetail(t, 'topup')}
                                            className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-white text-sm">{t.team_name}</div>
                                                <div className="text-[11px] text-slate-400">{t.player_1_name} &amp; {t.player_2_name}</div>
                                                {t.phone_number && (
                                                    <div className="text-[10px] font-mono text-slate-500">{t.phone_number}</div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-300">
                                                Rp{t.total_deposit.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                                    {t.total_cock_used} Kok
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-amber-400">
                                                Rp{t.total_cost.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono">
                                                <span className={`px-2.5 py-1 rounded-lg font-bold inline-block ${
                                                    isLow ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                    Rp{t.remaining_deposit.toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleOpenTeamDetail(t, 'topup')}
                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer"
                                                >
                                                    + Top-up
                                                </button>
                                                <button
                                                    onClick={() => handleOpenTeamDetail(t, 'refund')}
                                                    className="px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-[11px] transition-colors cursor-pointer"
                                                >
                                                    ↩ Refund
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. MODAL DETAIL TIM, TOP-UP, REFUND, DAN LOG WASIT */}
            {selectedTeam && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Header Modal */}
                        <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                            <div>
                                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider font-bold">Rincian Finansial Tim</span>
                                <h3 className="text-xl font-bold text-white">{selectedTeam.team_name}</h3>
                                <p className="text-xs text-slate-400">{selectedTeam.player_1_name} &amp; {selectedTeam.player_2_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTeam(null)}
                                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-mono cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Quick Balance Cards */}
                        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/60 border-b border-slate-800 text-center font-mono">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="text-[10px] text-slate-400">Total Deposit</div>
                                <div className="text-sm font-bold text-emerald-400">Rp{selectedTeam.total_deposit.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="text-[10px] text-slate-400">Biaya Kok ({selectedTeam.total_cock_used})</div>
                                <div className="text-sm font-bold text-amber-400">Rp{selectedTeam.total_cost.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="text-[10px] text-slate-400">Sisa Saldo</div>
                                <div className="text-sm font-bold text-amber-300">Rp{selectedTeam.remaining_deposit.toLocaleString('id-ID')}</div>
                            </div>
                        </div>

                        {/* Modal Tab Navigation */}
                        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-mono">
                            <button
                                onClick={() => setActiveModalTab('topup')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
                                    activeModalTab === 'topup' ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                ➕ Top-up Saldo
                            </button>
                            <button
                                onClick={() => setActiveModalTab('refund')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
                                    activeModalTab === 'refund' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                ↩ Refund / Cairkan
                            </button>
                            <button
                                onClick={() => setActiveModalTab('usage_history')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
                                    activeModalTab === 'usage_history' ? 'border-sky-400 text-sky-400 bg-sky-400/5' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                🏸 Log Wasit
                            </button>
                            <button
                                onClick={() => setActiveModalTab('deposit_history')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
                                    activeModalTab === 'deposit_history' ? 'border-slate-400 text-slate-200 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                📜 Riwayat Deposit
                            </button>
                        </div>

                        {/* Modal Tab Content */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            {/* TAB 1: FORM TOP-UP */}
                            {activeModalTab === 'topup' && (
                                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-mono text-slate-300 block mb-1 font-bold">Nominal Top-up Deposit (Rp)</label>
                                        <input
                                            type="number"
                                            step="5000"
                                            min="5000"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg font-mono font-bold text-emerald-400 focus:border-emerald-400 outline-none"
                                            required
                                        />
                                        <div className="flex gap-2 mt-2">
                                            {[20000, 50000, 100000].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setTopUpAmount(amt)}
                                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-mono text-slate-300 cursor-pointer"
                                                >
                                                    +Rp{amt.toLocaleString('id-ID')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono text-slate-300 block mb-1">Catatan / Keterangan</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Setoran tunai di meja registrasi"
                                            value={topUpNotes}
                                            onChange={(e) => setTopUpNotes(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-emerald-400 outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl font-mono text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Simpan & Tambahkan Deposit'}
                                    </button>
                                </form>
                            )}

                            {/* TAB 2: FORM REFUND */}
                            {activeModalTab === 'refund' && (
                                <form onSubmit={handleRefundSubmit} className="space-y-4">
                                    <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 space-y-1 font-mono">
                                        <p>Maksimal dana yang dapat dikembalikan: <b>Rp{selectedTeam.remaining_deposit.toLocaleString('id-ID')}</b></p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono text-slate-300 block mb-1 font-bold">Nominal Refund yang Dicairkan (Rp)</label>
                                        <input
                                            type="number"
                                            step="5000"
                                            min="1000"
                                            max={selectedTeam.remaining_deposit}
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg font-mono font-bold text-amber-400 focus:border-amber-400 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono text-slate-300 block mb-1">Catatan Refund</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Sisa deposit dikembalikan tunai"
                                            value={refundNotes}
                                            onChange={(e) => setRefundNotes(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || refundAmount <= 0 || refundAmount > selectedTeam.remaining_deposit}
                                        className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold rounded-xl font-mono text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Konfirmasi Pencairan Sisa Deposit'}
                                    </button>
                                </form>
                            )}

                            {/* TAB 3: AUDIT LOG DARI WASIT */}
                            {activeModalTab === 'usage_history' && (
                                <div className="space-y-2">
                                    {selectedTeam.usage_logs && selectedTeam.usage_logs.length > 0 ? (
                                        selectedTeam.usage_logs.map((log) => (
                                            <div key={log.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                                                <div>
                                                    <div className="font-bold text-white">
                                                        Match <span className="text-amber-300 font-mono">{log.match_id}</span> — Set {log.set_number}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Lawan: {log.opponent_name || 'N/A'} • {log.created_at}
                                                    </div>
                                                </div>
                                                <div className="text-right font-mono">
                                                    <div className="text-red-400 font-bold">-Rp{log.deduction_amount.toLocaleString('id-ID')}</div>
                                                    <div className="text-[10px] text-slate-500">({log.shuttlecock_qty} Kok / Split)</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-xs font-mono text-slate-500">
                                            Belum ada catatan pemotongan kok dari wasit untuk tim ini.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 4: RIWAYAT TOP-UP DEPOSIT */}
                            {activeModalTab === 'deposit_history' && (
                                <div className="space-y-2">
                                    {selectedTeam.deposit_logs && selectedTeam.deposit_logs.length > 0 ? (
                                        selectedTeam.deposit_logs.map((d) => (
                                            <div key={d.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                                                <div>
                                                    <div className="font-bold text-emerald-400 font-mono">+Rp{d.amount.toLocaleString('id-ID')}</div>
                                                    <div className="text-[11px] text-slate-400">{d.notes || 'Top up deposit'}</div>
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-500">
                                                    {d.created_at}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-xs font-mono text-slate-500">
                                            Belum ada riwayat deposit tersimpan.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. MODAL PENDAFTARAN TIM BARU & DEPOSIT AWAL */}
            {showAddTeamModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreateTeamSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-base text-white">Daftarkan Tim &amp; Setoran Awal</h3>
                                <p className="text-[11px] text-slate-400">Input registrasi tim langsung di meja turnamen</p>
                            </div>
                            <button type="button" onClick={() => setShowAddTeamModal(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-bold block mb-1">Nama Tim / Pasangan</label>
                            <input required type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Contoh: PB Perkasa" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400" />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-bold block mb-1">Kategori</label>
                            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400">
                                <option value="ganda_putra">Ganda Putra</option>
                                <option value="ganda_putri">Ganda Putri</option>
                                <option value="campuran">Ganda Campuran</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-300 font-bold block mb-1">Pemain 1</label>
                                <input required type="text" value={newPlayer1} onChange={e => setNewPlayer1(e.target.value)} placeholder="Nama Pemain 1" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-300 font-bold block mb-1">Pemain 2</label>
                                <input required type="text" value={newPlayer2} onChange={e => setNewPlayer2(e.target.value)} placeholder="Nama Pemain 2" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-bold block mb-1">No HP / WhatsApp (Opsional)</label>
                            <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="08..." className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400" />
                        </div>

                        <div>
                            <label className="text-xs text-amber-400 font-bold block mb-1">Setoran Deposit Awal (Rp)</label>
                            <input required type="number" step="5000" min="0" value={newInitialDeposit} onChange={e => setNewInitialDeposit(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-950 border border-amber-400/50 text-amber-300 font-mono font-bold text-base outline-none focus:border-amber-400" />
                        </div>

                        <button disabled={isSubmitting} type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-50">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Tim & Deposit Awal'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}