// src/pages/admin/BadmintonDepositSection.tsx
import React, { useState } from 'react'

export interface BadmintonTeamSummary {
    team_id: string
    team_name: string
    category: string
    player_1_name: string
    player_2_name: string
    phone_number: string
    total_deposit: number
    total_refunded: number
    total_cock_used: number
    total_cock_expense: number
    remaining_deposit: number
}

interface Props {
    teams: BadmintonTeamSummary[]
    onRefresh: () => void
    token?: string
}

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

export default function BadmintonDepositSection({ teams, onRefresh, token }: Props) {
    const [showAddTeamModal, setShowAddTeamModal] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [category, setCategory] = useState('ganda_putra')
    const [player1, setPlayer1] = useState('')
    const [player2, setPlayer2] = useState('')
    const [phone, setPhone] = useState('')
    const [initialDeposit, setInitialDeposit] = useState('50000')

    const [selectedTeam, setSelectedTeam] = useState<BadmintonTeamSummary | null>(null)
    const [actionType, setActionType] = useState<'topup' | 'refund'>('topup')
    const [nominal, setNominal] = useState('')
    const [depositNote, setDepositNote] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return
        setSubmitting(true)
        try {
            const apiBase = import.meta.env.VITE_API_URL
            const res = await fetch(`${apiBase}/api/badminton/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_name: teamName,
                    category,
                    player_1_name: player1,
                    player_2_name: player2,
                    phone_number: phone,
                    initial_deposit: parseFloat(initialDeposit) || 0
                })
            })
            if (res.ok) {
                onRefresh()
                setShowAddTeamModal(false)
                setTeamName('')
                setPlayer1('')
                setPlayer2('')
                setPhone('')
                setInitialDeposit('50000')
            } else {
                const err = await res.json()
                alert(err.detail || 'Gagal mendaftarkan tim')
            }
        } catch {
            alert('Terjadi kesalahan jaringan')
        } finally {
            setSubmitting(false)
        }
    }

    const handleProcessDeposit = async () => {
        if (!selectedTeam || !nominal || !token) return
        const amount = parseFloat(nominal)
        const apiBase = import.meta.env.VITE_API_URL
        setSubmitting(true)

        try {
            const endpoint = actionType === 'topup'
                ? `${apiBase}/api/badminton/deposits`
                : `${apiBase}/api/badminton/deposits/refund`

            const payload = actionType === 'topup'
                ? { team_id: selectedTeam.team_id, amount, type: 'deposit_masuk', admin_note: depositNote, created_by: 'Admin' }
                : { team_id: selectedTeam.team_id, amount, admin_note: depositNote }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                onRefresh()
                setSelectedTeam(null)
                setNominal('')
                setDepositNote('')
            } else {
                const err = await res.json()
                alert(err.detail || 'Gagal memproses deposit/refund')
            }
        } catch {
            alert('Terjadi kesalahan jaringan')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">Meja Deposit &amp; Shuttlecock</h1>
                    <p className="text-sm text-cream/50 mt-1">
                        Pusat setoran awal, pantau saldo sisa real-time, top-up, dan pencairan refund dana tim.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onRefresh}
                        className="px-4 py-2.5 rounded-xl border border-cream/20 bg-night2 text-xs font-mono text-[#38BDF8] hover:bg-cream/5 transition-all cursor-pointer"
                    >
                        ↻ Refresh Saldo
                    </button>
                    <button
                        onClick={() => setShowAddTeamModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#38BDF8] text-[#150B2E] font-bold text-xs hover:brightness-105 transition-all shadow-md cursor-pointer"
                    >
                        + Daftarkan Tim &amp; Deposit Awal
                    </button>
                </div>
            </div>

            {/* TABEL MASTER DEPOSIT */}
            <div className="bg-night2 border border-[#A78BFA]/30 rounded-2xl p-6 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-cream/10 text-cream/50 uppercase font-mono">
                                <th className="py-2.5 px-3">Nama Tim</th>
                                <th className="py-2.5 px-3">Kategori</th>
                                <th className="py-2.5 px-3">Pemain</th>
                                <th className="py-2.5 px-3">Deposit Masuk</th>
                                <th className="py-2.5 px-3 text-center">Kok Tambahan</th>
                                <th className="py-2.5 px-3">Biaya Kok (@5K)</th>
                                <th className="py-2.5 px-3 font-bold text-gold">Sisa Saldo</th>
                                <th className="py-2.5 px-3 text-center">Aksi Meja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream/5">
                            {teams.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-cream/40">
                                        Belum ada tim terdaftar. Klik tombol "+ Daftarkan Tim &amp; Deposit Awal".
                                    </td>
                                </tr>
                            ) : (
                                teams.map((t) => (
                                    <tr key={t.team_id} className="hover:bg-cream/5 transition-colors">
                                        <td className="py-3 px-3 font-bold text-cream">{t.team_name}</td>
                                        <td className="py-3 px-3 uppercase text-[10px] text-[#38BDF8] font-semibold">
                                            {t.category.replace('_', ' ')}
                                        </td>
                                        <td className="py-3 px-3 text-cream/70">{t.player_1_name} &amp; {t.player_2_name}</td>
                                        <td className="py-3 px-3 font-mono">{formatRupiah(t.total_deposit)}</td>
                                        <td className="py-3 px-3 text-center font-mono font-bold text-[#A78BFA]">{t.total_cock_used} Kok</td>
                                        <td className="py-3 px-3 font-mono text-red-400">{formatRupiah(t.total_cock_expense)}</td>
                                        <td className="py-3 px-3 font-mono font-bold text-court text-sm">
                                            {formatRupiah(t.remaining_deposit)}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="flex gap-1.5 justify-center">
                                                <button
                                                    onClick={() => { setSelectedTeam(t); setActionType('topup'); setNominal(''); }}
                                                    className="px-2.5 py-1 rounded-lg bg-court/20 text-court font-bold text-[10px] hover:bg-court/30 cursor-pointer"
                                                >
                                                    + Topup
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedTeam(t); setActionType('refund'); setNominal(String(Math.max(0, t.remaining_deposit))); }}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] hover:bg-amber-500/30 cursor-pointer"
                                                >
                                                    ↩ Refund
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL REGISTRASI TIM & DEPOSIT */}
            {showAddTeamModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreateTeam} className="bg-night2 border border-[#A78BFA]/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h3 className="font-bold text-base text-white">Daftarkan Tim &amp; Deposit Awal</h3>
                            <button type="button" onClick={() => setShowAddTeamModal(false)} className="text-white/50 text-xl font-bold cursor-pointer">✕</button>
                        </div>
                        <div>
                            <label className="text-xs text-cream/70 font-bold block mb-1">Nama Tim / Pasangan</label>
                            <input required type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Contoh: PB Perkasa" className="w-full p-3 rounded-xl bg-night border border-cream/15 text-white text-xs outline-none focus:border-gold" />
                        </div>
                        <div>
                            <label className="text-xs text-cream/70 font-bold block mb-1">Kategori</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl bg-night border border-cream/15 text-white text-xs outline-none focus:border-gold">
                                <option value="ganda_putra">Ganda Putra</option>
                                <option value="ganda_putri">Ganda Putri</option>
                                <option value="campuran">Ganda Campuran</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-cream/70 font-bold block mb-1">Pemain 1</label>
                                <input required type="text" value={player1} onChange={e => setPlayer1(e.target.value)} className="w-full p-3 rounded-xl bg-night border border-cream/15 text-white text-xs outline-none focus:border-gold" />
                            </div>
                            <div>
                                <label className="text-xs text-cream/70 font-bold block mb-1">Pemain 2</label>
                                <input required type="text" value={player2} onChange={e => setPlayer2(e.target.value)} className="w-full p-3 rounded-xl bg-night border border-cream/15 text-white text-xs outline-none focus:border-gold" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-cream/70 font-bold block mb-1">No HP / WhatsApp</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08..." className="w-full p-3 rounded-xl bg-night border border-cream/15 text-white text-xs outline-none focus:border-gold" />
                        </div>
                        <div>
                            <label className="text-xs text-gold font-bold block mb-1">Setoran Deposit Awal (Rp)</label>
                            <input required type="number" step="5000" value={initialDeposit} onChange={e => setInitialDeposit(e.target.value)} className="w-full p-3 rounded-xl bg-night border border-gold/40 text-gold font-mono font-bold text-base outline-none focus:border-gold" />
                        </div>
                        <button disabled={submitting} type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#38BDF8] text-[#150B2E] font-bold text-xs cursor-pointer hover:brightness-105 disabled:opacity-50">
                            {submitting ? 'Menyimpan...' : 'Simpan Tim & Deposit'}
                        </button>
                    </form>
                </div>
            )}

            {/* MODAL TOPUP / REFUND */}
            {selectedTeam && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-night2 border border-[#A78BFA]/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-cream/10 pb-3">
                            <h3 className="font-bold text-base text-white">
                                {actionType === 'topup' ? 'Topup Saldo Deposit' : 'Pencairan / Refund Sisa Saldo'}
                            </h3>
                            <button onClick={() => setSelectedTeam(null)} className="text-white/50 text-xl font-bold cursor-pointer">✕</button>
                        </div>
                        <div className="text-xs text-cream/70">
                            Tim: <b className="text-white">{selectedTeam.team_name}</b><br />
                            Sisa Saldo Saat Ini: <b className="text-court font-mono">{formatRupiah(selectedTeam.remaining_deposit)}</b>
                        </div>
                        <div>
                            <label className="text-xs text-gold font-bold block mb-1">Nominal (Rp)</label>
                            <input type="number" step="5000" value={nominal} onChange={e => setNominal(e.target.value)} className="w-full p-3 rounded-xl bg-night border border-gold/40 text-gold font-mono font-bold text-base outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-cream/70 font-bold block mb-1">Catatan Admin</label>
                            <input type="text" value={depositNote} onChange={e => setDepositNote(e.target.value)} placeholder="Contoh: Sisa deposit dikembalikan tunai" className="w-full p-2.5 rounded-xl bg-night border border-cream/15 text-white text-xs outline-none" />
                        </div>
                        <button
                            disabled={submitting}
                            onClick={handleProcessDeposit}
                            className={`w-full py-3 rounded-xl font-bold text-xs cursor-pointer transition-all disabled:opacity-50 ${
                                actionType === 'topup' ? 'bg-court text-night hover:brightness-105' : 'bg-amber-500 text-night hover:brightness-105'
                            }`}
                        >
                            {submitting ? 'Memproses...' : (actionType === 'topup' ? 'Konfirmasi Topup' : 'Konfirmasi Refund')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}