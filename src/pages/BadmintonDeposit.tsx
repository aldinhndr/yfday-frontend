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
    const [selectedTeam, setSelectedTeam] = useState<BadmintonTeamSummary | null>(null)
    const [topUpAmount, setTopUpAmount] = useState<number>(50000)
    const [topUpNotes, setTopUpNotes] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [activeModalTab, setActiveModalTab] = useState<'topup' | 'usage_history' | 'deposit_history'>('topup')

    const totalDepositAll = teams.reduce((acc, t) => acc + (t.total_deposit || 0), 0)
    const totalCostAll = teams.reduce((acc, t) => acc + (t.total_cost || 0), 0)
    const totalRemainingAll = teams.reduce((acc, t) => acc + (t.remaining_deposit || 0), 0)
    const totalCocksAll = teams.reduce((acc, t) => acc + (t.total_cock_used || 0), 0)

    const handleOpenTeamDetail = (team: BadmintonTeamSummary) => {
        setSelectedTeam(team)
        setActiveModalTab('topup')
        setTopUpAmount(50000)
        setTopUpNotes('')
    }

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
                    notes: topUpNotes || 'Top up via Admin'
                })
            })

            if (!res.ok) throw new Error('Gagal memproses deposit')

            alert('✅ Deposit berhasil ditambahkan!')
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
            {/* STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Total Deposit Masuk</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-1">
                        Rp{totalDepositAll.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Total Biaya Kok</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-1">
                        Rp{totalCostAll.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">({totalCocksAll} Kok Terpakai)</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Sisa Saldo Semua Tim</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 mt-1">
                        Rp{totalRemainingAll.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Total Partisipan</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white mt-1">
                        {teams.length} <span className="text-xs font-normal text-slate-400">Tim</span>
                    </div>
                </div>
            </div>

            {/* RINGKASAN KOK PER MATCH */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🏸</span> Rekap Penggunaan Kok Per Match
                    </h2>
                    <p className="text-xs text-slate-400">Pencatatan real-time jumlah shuttlecock dari wasit.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {matchSummaries.length > 0 ? (
                        matchSummaries.map((m) => (
                            <div key={m.match_id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
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
                            Belum ada aktivitas match yang tercatat.
                        </div>
                    )}
                </div>
            </div>

            {/* TABEL TIM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-white">Daftar Tim &amp; Saldo Deposit</h2>
                        <p className="text-xs text-slate-400">Klik baris tim untuk melihat log wasit atau menambah saldo.</p>
                    </div>
                    {onRefresh && (
                        <button
                            onClick={() => onRefresh()}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono text-slate-200 cursor-pointer"
                        >
                            🔄 Refresh Data
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Nama Tim &amp; Pemain</th>
                                <th className="py-3 px-4">Total Deposit</th>
                                <th className="py-3 px-4">Kok Terpakai</th>
                                <th className="py-3 px-4">Total Biaya</th>
                                <th className="py-3 px-4">Sisa Saldo</th>
                                <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {teams.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                                        Belum ada data tim.
                                    </td>
                                </tr>
                            ) : (
                                teams.map((t) => {
                                    const isLow = t.remaining_deposit < 20000
                                    return (
                                        <tr
                                            key={t.team_id}
                                            onClick={() => handleOpenTeamDetail(t)}
                                            className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-white text-sm">{t.team_name}</div>
                                                <div className="text-[11px] text-slate-400">{t.player_1_name} &amp; {t.player_2_name}</div>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-300">
                                                Rp{t.total_deposit.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-white">
                                                {t.total_cock_used} Kok
                                            </td>
                                            <td className="py-3 px-4 font-mono text-amber-400">
                                                Rp{t.total_cost.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 font-mono">
                                                <span className={`px-2 py-1 rounded font-bold ${
                                                    isLow ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    Rp{t.remaining_deposit.toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleOpenTeamDetail(t)
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-[11px] cursor-pointer"
                                                >
                                                    Lihat &amp; Top-up
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

            {/* MODAL DETAIL TIM */}
            {selectedTeam && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
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

                        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/60 border-b border-slate-800 text-center font-mono">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="text-[10px] text-slate-400">Total Deposit</div>
                                <div className="text-sm font-bold text-emerald-400">Rp{selectedTeam.total_deposit.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="text-[10px] text-slate-400">Biaya Kok ({selectedTeam.total_cock_used})</div>
                                <div className="text-sm font-bold text-amber-400">Rp{selectedTeam.total_cost.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="text-[10px] text-slate-400">Sisa Saldo</div>
                                <div className="text-sm font-bold text-amber-300">Rp{selectedTeam.remaining_deposit.toLocaleString('id-ID')}</div>
                            </div>
                        </div>

                        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-mono">
                            <button
                                onClick={() => setActiveModalTab('topup')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer ${
                                    activeModalTab === 'topup' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-slate-400'
                                }`}
                            >
                                ➕ Top-up Saldo
                            </button>
                            <button
                                onClick={() => setActiveModalTab('usage_history')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer ${
                                    activeModalTab === 'usage_history' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-slate-400'
                                }`}
                            >
                                🏸 Log Wasit
                            </button>
                            <button
                                onClick={() => setActiveModalTab('deposit_history')}
                                className={`flex-1 py-3 border-b-2 font-bold cursor-pointer ${
                                    activeModalTab === 'deposit_history' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-slate-400'
                                }`}
                            >
                                📜 Riwayat Deposit
                            </button>
                        </div>

                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            {activeModalTab === 'topup' && (
                                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-mono text-slate-300 block mb-1 font-bold">Nominal Top-up (Rp)</label>
                                        <input
                                            type="number"
                                            step="5000"
                                            min="10000"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg font-mono font-bold text-amber-300 focus:border-amber-400 outline-none"
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
                                        <label className="text-xs font-mono text-slate-300 block mb-1">Keterangan</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Tunai / Transfer"
                                            value={topUpNotes}
                                            onChange={(e) => setTopUpNotes(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold rounded-xl font-mono text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Simpan & Tambah Deposit'}
                                    </button>
                                </form>
                            )}

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
                                            Belum ada riwayat top-up tersimpan.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}