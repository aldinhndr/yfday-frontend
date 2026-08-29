// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RequireAdmin from '../components/RequireAdmin'
import { useAuth } from '../context/AuthContext'
import AdminSidebar, { type AdminSection } from '../components/admin/AdminSidebar'
import BadmintonDepositSection, { type BadmintonTeamSummary } from './BadmintonDeposit'
import WasitBadmintonSection from './WasitBadmintonSkor'

export interface AdminUser {
    id: string
    email: string
    role: string
    name?: string
}

interface RegistrationRow {
    id: string
    nama_peserta?: string
    nama_tim?: string
    kategori?: string
    no_hp?: string
    asal_daerah?: string
    jumlah_slot?: number
    bukti_bayar_url?: string
    surat_url?: string
    foto_url?: string
    status?: 'pending' | 'verified' | 'rejected'
    admin_note?: string
    created_at?: string
    _lomba: string
    [key: string]: any
}

interface StatsData {
    overall: { total_pendaftar: number; total_slot: number }
    by_lomba: Record<string, {
        pendaftar: number
        total_slot: number
        sub_categories?: Record<string, { pendaftar: number; total_slot: number }>
    }>
}

const HTM: Record<string, { label: string; harga: number; satuan: string }> = {
    pes: { label: 'PES', harga: 25000, satuan: 'slot' },
    badminton: { label: 'Badminton', harga: 75000, satuan: 'tim' },
    tenis: { label: 'Tenis Meja', harga: 35000, satuan: 'slot' },
}

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

export default function AdminDashboard() {
    const { session } = useAuth()
    const [stats, setStats] = useState<StatsData | null>(null)
    const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
    const [section, setSection] = useState<AdminSection>('overview')
    const [badmintonSubFilter, setBadmintonSubFilter] = useState<string>('all')
    const [badmintonTeams, setBadmintonTeams] = useState<BadmintonTeamSummary[]>([])
    const [fetching, setFetching] = useState(true)

    const [selectedRow, setSelectedRow] = useState<RegistrationRow | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [adminNoteInput, setAdminNoteInput] = useState('')

    const fetchData = async () => {
        if (!session?.access_token) return
        setFetching(true)
        try {
            const headers = { Authorization: `Bearer ${session.access_token}` }
            const apiBase = import.meta.env.VITE_API_URL

            const [resStats, resRegs, resBadminton] = await Promise.all([
                fetch(`${apiBase}/api/admin/stats`, { headers }),
                fetch(`${apiBase}/api/admin/registrations`, { headers }),
                fetch(`${apiBase}/api/badminton/admin/summary`, { headers }).catch(() => null)
            ])

            if (resStats.ok) setStats(await resStats.json())
            if (resRegs.ok) {
                const regData = await resRegs.json()
                setRegistrations(regData.data || [])
            }
            if (resBadminton && resBadminton.ok) {
                const bData = await resBadminton.json()
                setBadmintonTeams(bData.data || [])
            }
        } catch (err) {
            console.error('Error fetching admin data:', err)
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [session])

    const handleUpdateStatus = async (newStatus: 'verified' | 'rejected') => {
        if (!selectedRow || !session?.access_token) return
        setUpdatingStatus(true)
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/admin/registrations/${selectedRow._lomba}/${selectedRow.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ status: newStatus, admin_note: adminNoteInput }),
                }
            )
            if (!res.ok) throw new Error('Gagal memperbarui status')

            setRegistrations((prev) =>
                prev.map((item) =>
                    item.id === selectedRow.id && item._lomba === selectedRow._lomba
                        ? { ...item, status: newStatus, admin_note: adminNoteInput }
                        : item
                )
            )
            setSelectedRow(null)
        } catch {
            alert('Gagal memperbarui status verifikasi')
        } finally {
            setUpdatingStatus(false)
        }
    }

    const lombaSection = section === 'pes' || section === 'badminton' || section === 'tenis' ? section : null

    const filteredRows = registrations.filter((row) => {
        if (lombaSection && row._lomba !== lombaSection) return false
        if (lombaSection === 'badminton' && badmintonSubFilter !== 'all') {
            return (row.kategori || '').toLowerCase() === badmintonSubFilter.toLowerCase()
        }
        return true
    })

    const formatLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    const isMediaUrl = (val: any) => typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))

    // Rekap Keuangan
    const financeRows = registrations.filter((r) => HTM[r._lomba])
    const financeSummary = Object.keys(HTM).map((lomba) => {
        const rows = financeRows.filter((r) => r._lomba === lomba)
        const unitCount = (status?: string) =>
            rows.filter((r) => !status || r.status === status)
                .reduce((sum, r) => sum + (r.jumlah_slot || 1), 0)

        return {
            lomba,
            label: HTM[lomba].label,
            harga: HTM[lomba].harga,
            satuan: HTM[lomba].satuan,
            totalUnit: unitCount(),
            verifiedUnit: unitCount('verified'),
            pendingUnit: unitCount('pending'),
            verifiedRevenue: unitCount('verified') * HTM[lomba].harga,
            pendingRevenue: unitCount('pending') * HTM[lomba].harga,
        }
    })
    const totalVerifiedRevenue = financeSummary.reduce((s, f) => s + f.verifiedRevenue, 0)
    const totalPendingRevenue = financeSummary.reduce((s, f) => s + f.pendingRevenue, 0)

    return (
        <RequireAdmin>
            {(admin: AdminUser) => (
                <div className="min-h-screen bg-night text-cream">
                    {/* SIDEBAR TUNGGAL TERPADU */}
                    <AdminSidebar role={admin.role} email={admin.email} active={section} onChange={setSection} />

                    <main className="lg:pl-64 pt-16 lg:pt-0">
                        <div className="max-w-6xl mx-auto px-6 py-8">

                            {/* 1. RINGKASAN / OVERVIEW */}
                            {section === 'overview' && (
                                <>
                                    <div className="mb-6">
                                        <h1 className="font-display text-2xl sm:text-3xl font-bold">Ringkasan</h1>
                                        <p className="text-sm text-cream/50 mt-1">Total pendaftaran seluruh cabang lomba Youth Fun Day 2026</p>
                                    </div>

                                    {/* SHORTCUT TURNAMEN PES */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <Link
                                            to="/admin/rolling/pes"
                                            className="group bg-gradient-to-br from-[#3B1E7A]/60 to-[#150B2E] border border-[#A78BFA]/30 hover:border-[#A78BFA] p-5 rounded-2xl transition-all shadow-lg flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-[10px] font-mono font-bold text-[#A78BFA] uppercase tracking-wider bg-[#A78BFA]/10 px-2 py-0.5 rounded border border-[#A78BFA]/20">PES Control</span>
                                                <h3 className="font-display text-base font-bold text-white mt-1 group-hover:text-[#A78BFA] transition-colors">🎮 Controller Rolling PES</h3>
                                                <p className="text-[11px] text-cream/60 mt-0.5">Layar 1 — Input &amp; undian bagan</p>
                                            </div>
                                            <span className="text-lg text-[#A78BFA] group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>

                                        <a
                                            href="/stage/pes"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-gradient-to-br from-[#0c2a4d]/60 to-[#0a0716] border border-[#38BDF8]/30 hover:border-[#38BDF8] p-5 rounded-2xl transition-all shadow-lg flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">PES Display</span>
                                                <h3 className="font-display text-base font-bold text-white mt-1 group-hover:text-[#38BDF8] transition-colors">🖥️ Panggung Proyektor PES</h3>
                                                <p className="text-[11px] text-cream/60 mt-0.5">Layar 2 — Bagan sinkron proyektor</p>
                                            </div>
                                            <span className="text-lg text-[#38BDF8] group-hover:translate-x-1 transition-transform">↗</span>
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-night2 border border-cream/10 rounded-2xl p-5">
                                            <p className="text-xs text-cream/50">Total Pendaftar</p>
                                            <p className="font-display text-3xl font-bold text-gold mt-1">{stats?.overall.total_pendaftar ?? '-'}</p>
                                        </div>
                                        <div className="bg-night2 border border-cream/10 rounded-2xl p-5">
                                            <p className="text-xs text-cream/50">Total Slot</p>
                                            <p className="font-display text-3xl font-bold text-court mt-1">{stats?.overall.total_slot ?? '-'}</p>
                                        </div>
                                        {Object.entries(stats?.by_lomba ?? {}).map(([lomba, val]) => (
                                            <div key={lomba} className="bg-night2 border border-cream/10 rounded-2xl p-5">
                                                <p className="text-xs text-cream/50 capitalize">{lomba}</p>
                                                <p className="font-display text-3xl font-bold text-violet mt-1">{val.pendaftar}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-night2 border border-cream/10 rounded-2xl p-6">
                                        <h2 className="font-display text-lg font-bold mb-4">Pendaftaran Terbaru</h2>
                                        {fetching ? (
                                            <p className="text-cream/40 text-sm py-6 text-center">Memuat data...</p>
                                        ) : (
                                            <RegistrationTable
                                                rows={registrations.slice(0, 8)}
                                                showKategori={false}
                                                onInspect={(row) => { setSelectedRow(row); setAdminNoteInput(row.admin_note || '') }}
                                            />
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 2. MEJA DEPOSIT & KOK BADMINTON */}
                            {section === 'badminton_deposit' && (
                                <BadmintonDepositSection
                                    teams={badmintonTeams}
                                    onRefresh={fetchData}
                                    token={session?.access_token}
                                />
                            )}

                            {/* 3. WASIT BADMINTON (SCORER & KOK) */}
                            {section === 'wasit_badminton' && (
                                <WasitBadmintonSection
                                    teams={badmintonTeams}
                                    onCockUsed={fetchData}
                                    token={session?.access_token}
                                />
                            )}

                            {/* 4. PENDAFTAR LOMBA (PES / BADMINTON / TENIS MEJA) */}
                            {lombaSection && (
                                <>
                                    <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
                                        <div>
                                            <h1 className="font-display text-2xl sm:text-3xl font-bold capitalize">{HTM[lombaSection]?.label || lombaSection}</h1>
                                            <p className="text-sm text-cream/50 mt-1">{filteredRows.length} pendaftar</p>
                                        </div>

                                        {lombaSection === 'pes' && (
                                            <div className="flex gap-2">
                                                <Link
                                                    to="/admin/rolling/pes"
                                                    className="px-4 py-2 rounded-xl bg-[#A78BFA] text-[#150B2E] font-bold text-xs hover:brightness-105 transition-all shadow-md"
                                                >
                                                    🎮 Buka Rolling PES
                                                </Link>
                                                <a
                                                    href="/stage/pes"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] font-bold text-xs hover:bg-[#38BDF8]/20 transition-all shadow-md"
                                                >
                                                    🖥️ Panggung ↗
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {lombaSection === 'badminton' && (
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-xs text-cream/50 font-semibold uppercase">Filter Kategori:</span>
                                            <select
                                                value={badmintonSubFilter}
                                                onChange={(e) => setBadmintonSubFilter(e.target.value)}
                                                className="bg-night2 border border-cream/20 text-cream text-xs rounded-lg px-3 py-2 outline-none focus:border-gold"
                                            >
                                                <option value="all">Semua Kategori</option>
                                                <option value="ganda_putra">Ganda Putra</option>
                                                <option value="ganda_putri">Ganda Putri</option>
                                                <option value="campuran">Campuran</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="bg-night2 border border-cream/10 rounded-2xl p-6">
                                        {fetching ? (
                                            <p className="text-cream/40 text-sm py-12 text-center">Memuat data...</p>
                                        ) : filteredRows.length === 0 ? (
                                            <p className="text-cream/40 text-sm py-12 text-center">Belum ada pendaftar di kategori ini.</p>
                                        ) : (
                                            <RegistrationTable
                                                rows={filteredRows}
                                                showKategori={lombaSection === 'badminton'}
                                                onInspect={(row) => { setSelectedRow(row); setAdminNoteInput(row.admin_note || '') }}
                                            />
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 5. KEUANGAN & BUKTI BAYAR */}
                            {section === 'keuangan' && (
                                <>
                                    <div className="mb-6">
                                        <h1 className="font-display text-2xl sm:text-3xl font-bold">Keuangan</h1>
                                        <p className="text-sm text-cream/50 mt-1">Rekonsiliasi estimasi pemasukan berdasarkan status verifikasi pembayaran</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-court/10 border border-court/25 rounded-2xl p-5">
                                            <p className="text-xs text-court/80 uppercase font-semibold">Pemasukan Terverifikasi</p>
                                            <p className="font-display text-3xl font-bold text-court mt-1">{formatRupiah(totalVerifiedRevenue)}</p>
                                        </div>
                                        <div className="bg-gold/10 border border-gold/25 rounded-2xl p-5">
                                            <p className="text-xs text-gold/80 uppercase font-semibold">Menunggu Verifikasi</p>
                                            <p className="font-display text-3xl font-bold text-gold mt-1">{formatRupiah(totalPendingRevenue)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-night2 border border-cream/10 rounded-2xl p-6 mb-6">
                                        <h2 className="font-display text-lg font-bold mb-4">Ringkasan per Lomba</h2>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-cream/10 text-cream/50 uppercase">
                                                        <th className="py-2.5 px-3">Lomba</th>
                                                        <th className="py-2.5 px-3">HTM</th>
                                                        <th className="py-2.5 px-3">Terverifikasi</th>
                                                        <th className="py-2.5 px-3">Pending</th>
                                                        <th className="py-2.5 px-3">Pemasukan Terverifikasi</th>
                                                        <th className="py-2.5 px-3">Potensi Pending</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-cream/5">
                                                    {financeSummary.map((f) => (
                                                        <tr key={f.lomba}>
                                                            <td className="py-3 px-3 font-semibold">{f.label}</td>
                                                            <td className="py-3 px-3 text-cream/60">{formatRupiah(f.harga)}/{f.satuan}</td>
                                                            <td className="py-3 px-3 text-court">{f.verifiedUnit} {f.satuan}</td>
                                                            <td className="py-3 px-3 text-gold">{f.pendingUnit} {f.satuan}</td>
                                                            <td className="py-3 px-3 font-semibold text-court">{formatRupiah(f.verifiedRevenue)}</td>
                                                            <td className="py-3 px-3 text-gold/80">{formatRupiah(f.pendingRevenue)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-night2 border border-cream/10 rounded-2xl p-6">
                                        <h2 className="font-display text-lg font-bold mb-1">Bukti Pembayaran — Cek Silang</h2>
                                        <p className="text-xs text-cream/50 mb-4">Cocokkan tiap bukti transfer dengan mutasi rekening sebelum verifikasi.</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-cream/10 text-cream/50 uppercase">
                                                        <th className="py-2.5 px-3">Status</th>
                                                        <th className="py-2.5 px-3">Lomba</th>
                                                        <th className="py-2.5 px-3">Nama</th>
                                                        <th className="py-2.5 px-3">Estimasi Nominal</th>
                                                        <th className="py-2.5 px-3 text-center">Bukti Bayar</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-cream/5">
                                                    {financeRows.filter((r) => r.bukti_bayar_url).map((r) => (
                                                        <tr key={r.id} className="hover:bg-cream/5">
                                                            <td className="py-3 px-3">
                                                                <StatusBadge status={r.status} />
                                                            </td>
                                                            <td className="py-3 px-3 capitalize">{HTM[r._lomba]?.label}</td>
                                                            <td className="py-3 px-3 font-medium">{r.nama_peserta || r.nama_tim || r.nama || '-'}</td>
                                                            <td className="py-3 px-3">{formatRupiah((r.jumlah_slot || 1) * (HTM[r._lomba]?.harga || 0))}</td>
                                                            <td className="py-3 px-3 text-center">
                                                                <a href={r.bukti_bayar_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-semibold">
                                                                    Lihat ↗
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </main>

                    {/* MODAL INSPEKSI FORM */}
                    {selectedRow && (
                        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-night2 border border-cream/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
                                <div className="flex justify-between items-start border-b border-cream/10 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                                                Lomba: {selectedRow._lomba}
                                            </span>
                                            {selectedRow.kategori && (
                                                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-court/10 text-court border border-court/20">
                                                    Kategori: {selectedRow.kategori}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="font-display text-2xl font-bold text-cream">
                                            {selectedRow.nama_peserta || selectedRow.nama_tim || selectedRow.nama || 'Detail Pendaftar'}
                                        </h2>
                                    </div>
                                    <button onClick={() => setSelectedRow(null)} className="text-cream/50 hover:text-cream text-xl font-bold">✕</button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-display text-xs font-bold text-gold uppercase tracking-wider">Rincian Atribut Lengkap</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-night p-4 rounded-xl border border-cream/10 text-xs">
                                        {Object.entries(selectedRow)
                                            .filter(([key]) => !['_lomba', 'status', 'admin_note'].includes(key))
                                            .map(([key, val]) => {
                                                const isFile = isMediaUrl(val)
                                                return (
                                                    <div key={key} className={`p-2.5 rounded-lg border border-cream/5 bg-night2/40 ${isFile ? 'col-span-1 sm:col-span-2' : ''}`}>
                                                        <p className="text-[10px] text-cream/40 uppercase font-bold mb-1">{formatLabel(key)}</p>
                                                        {isFile ? (
                                                            <div className="flex flex-col gap-2 mt-1">
                                                                {val.match(/\.(jpeg|jpg|gif|png|webp)/i) && (
                                                                    <img
                                                                        src={val}
                                                                        alt={key}
                                                                        className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 border border-cream/10"
                                                                        onClick={() => window.open(val, '_blank')}
                                                                    />
                                                                )}
                                                                <a href={val} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline font-semibold flex items-center gap-1">
                                                                    📎 Buka File ({formatLabel(key)}) ↗
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <p className="font-semibold text-cream break-words">{val !== null && val !== undefined && val !== '' ? String(val) : '-'}</p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>

                                <div className="border-t border-cream/10 pt-4 space-y-4">
                                    <label className="block">
                                        <span className="text-xs text-cream/70 mb-1 block">Catatan Verifikasi Admin</span>
                                        <input
                                            type="text"
                                            value={adminNoteInput}
                                            onChange={(e) => setAdminNoteInput(e.target.value)}
                                            placeholder="Contoh: Bukti transfer valid, berkas lengkap"
                                            className="w-full bg-night border border-cream/15 rounded-lg px-3 py-2 text-xs text-cream outline-none focus:border-gold"
                                        />
                                    </label>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            disabled={updatingStatus}
                                            onClick={() => handleUpdateStatus('rejected')}
                                            className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 font-semibold text-xs hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                        >
                                            Tolak Pendaftaran
                                        </button>
                                        <button
                                            type="button"
                                            disabled={updatingStatus}
                                            onClick={() => handleUpdateStatus('verified')}
                                            className="px-5 py-2 rounded-full bg-court text-night font-semibold text-xs hover:scale-105 transition-transform disabled:opacity-50"
                                        >
                                            {updatingStatus ? 'Memproses...' : 'Setujui & Verifikasi'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </RequireAdmin>
    )
}

function StatusBadge({ status }: { status?: string }) {
    const cls = status === 'verified'
        ? 'bg-green-500/10 text-green-400 border-green-500/20'
        : status === 'rejected'
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cls}`}>{status || 'pending'}</span>
}

function RegistrationTable({
    rows, showKategori, onInspect,
}: { rows: RegistrationRow[]; showKategori: boolean; onInspect: (row: RegistrationRow) => void }) {
    if (rows.length === 0) {
        return <p className="text-cream/40 text-sm py-8 text-center">Belum ada data.</p>
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
                <thead>
                    <tr className="border-b border-cream/10 text-cream/50 uppercase">
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Lomba</th>
                        {showKategori && <th className="py-3 px-4">Kategori</th>}
                        <th className="py-3 px-4">Peserta / Tim</th>
                        <th className="py-3 px-4">No HP / WA</th>
                        <th className="py-3 px-4">Asal Daerah</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-cream/5">
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-cream/5 transition-colors">
                            <td className="py-3.5 px-4"><StatusBadge status={row.status} /></td>
                            <td className="py-3.5 px-4">
                                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                                    {row._lomba}
                                </span>
                            </td>
                            {showKategori && <td className="py-3.5 px-4 font-medium text-court">{row.kategori || '-'}</td>}
                            <td className="py-3.5 px-4 font-semibold text-cream">{row.nama_peserta || row.nama_tim || row.nama || '-'}</td>
                            <td className="py-3.5 px-4 text-cream/70">{row.no_hp || row.whatsapp || '-'}</td>
                            <td className="py-3.5 px-4 text-cream/70">{row.asal_daerah || row.instansi || '-'}</td>
                            <td className="py-3.5 px-4 text-center">
                                <button
                                    onClick={() => onInspect(row)}
                                    className="px-3 py-1.5 rounded-lg bg-cream/10 text-cream hover:bg-cream/20 text-xs font-medium transition-colors"
                                >
                                    Inspect →
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}