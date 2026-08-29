// src/pages/admin/WasitBadmintonSection.tsx
import { useState, useMemo } from 'react'
import type { BadmintonTeamSummary } from './BadmintonDeposit'

interface WasitBadmintonSectionProps {
    teams: BadmintonTeamSummary[]
    onCockUsed: () => void | Promise<void>
    token?: string
}

interface MatchSchedule {
    id: string
    time: string
    round: string
    teamA: string
    teamB: string
}

const SCHEDULE_DATA: MatchSchedule[] = [
    { id: 'M01', time: '16.00–16.30', round: 'Babak 1', teamA: '12. Bpk Pdt & Geber (GPIN)', teamB: '2. GBI IFLC Bandar Lampung' },
    { id: 'M02', time: '16.30–17.00', round: 'Babak 1', teamA: '10. Joshua & Evan (GPIN)', teamB: '18. Bram Timothy Nugroho' },
    { id: 'M03', time: '17.00–17.30', round: 'Babak 1', teamA: '7. Rinto & Kevin (GPIN Filadelfia)', teamB: '17. Bang Ferry & Pak De...' },
    { id: 'M04', time: '17.30–18.00', round: 'Babak 2', teamA: '3. Berkat & Natanael (GPIN)', teamB: 'Winner M01' },
    { id: 'M05', time: '18.00–18.30', round: 'Babak 2', teamA: '13. Pak Ginting & Pak Pur', teamB: '15. Gabriel & Alvin (GPDI)' },
    { id: 'M06', time: '18.30–19.00', round: 'Babak 2', teamA: '19. Aditya Kristianto & Bill', teamB: '6. Aldin & Agus (Filadelfia)' },
    { id: 'M07', time: '19.00–19.30', round: 'Babak 2', teamA: '9. Julfan & Satria (JKI)', teamB: '14. Lukas & Abel (GITJ)' },
    { id: 'M08', time: '19.30–20.00', round: 'Babak 2', teamA: '1. GBI IFLC Bandar Lampung', teamB: 'Winner M02' },
    { id: 'M09', time: '20.00–20.30', round: 'Babak 2', teamA: '11. Tegar & Rexy (GKI)', teamB: '8. Riko & Elman (GPIN)' },
    { id: 'M10', time: '20.30–21.00', round: 'Babak 2', teamA: '5. Ardi & Artado (GITJ)', teamB: 'Winner M03' },
]

export default function WasitBadmintonSection({ teams, onCockUsed, token }: WasitBadmintonSectionProps) {
    const [selectedMatchId, setSelectedMatchId] = useState<string>('M01')
    const [currentSet, setCurrentSet] = useState<1 | 2 | 3>(1)
    
    // Skor per set: [Set 1, Set 2, Set 3]
    const [scoreA, setScoreA] = useState<[number, number, number]>([0, 0, 0])
    const [scoreB, setScoreB] = useState<[number, number, number]>([0, 0, 0])
    const [matchCocks, setMatchCocks] = useState<number>(0)
    const [statusLog, setStatusLog] = useState<string>('')
    const [loadingCock, setLoadingCock] = useState<boolean>(false)

    const currentMatch = useMemo(() => {
        return SCHEDULE_DATA.find(m => m.id === selectedMatchId) || SCHEDULE_DATA[0]
    }, [selectedMatchId])

    // Evaluasi aturan BWF (21 poin, deuce maks 30)
    const checkSetWinner = (sA: number, sB: number): 'A' | 'B' | null => {
        if (sA === 30) return 'A'
        if (sB === 30) return 'B'
        if (sA >= 21 && sA - sB >= 2) return 'A'
        if (sB >= 21 && sB - sA >= 2) return 'B'
        return null
    }

    let setsWonA = 0
    let setsWonB = 0
    for (let i = 0; i < 3; i++) {
        const w = checkSetWinner(scoreA[i], scoreB[i])
        if (w === 'A') setsWonA++
        if (w === 'B') setsWonB++
    }

    const isMatchEnded = setsWonA === 2 || setsWonB === 2
    const matchWinnerName = setsWonA === 2 ? currentMatch.teamA : setsWonB === 2 ? currentMatch.teamB : null

    const handleSelectMatch = (matchId: string) => {
        setSelectedMatchId(matchId)
        setScoreA([0, 0, 0])
        setScoreB([0, 0, 0])
        setCurrentSet(1)
        setMatchCocks(0)
        setStatusLog(`Beralih ke ${matchId}`)
    }

    const handleAddScore = (side: 'A' | 'B', delta: number) => {
        if (isMatchEnded && delta > 0) {
            alert('Pertandingan sudah selesai. Silakan reset jika ingin mengubah skor.')
            return
        }

        const setIdx = currentSet - 1
        if (side === 'A') {
            const nextVal = Math.max(0, Math.min(30, scoreA[setIdx] + delta))
            const newArr: [number, number, number] = [...scoreA]
            newArr[setIdx] = nextVal
            setScoreA(newArr)
            if (nextVal >= 20 && scoreB[setIdx] >= 20 && nextVal === scoreB[setIdx] && nextVal < 30) {
                setStatusLog('⚠️ JUS (DEUCE)! Mencari selisih 2 poin (Maksimal 30 Poin).')
            } else {
                setStatusLog('')
            }
        } else {
            const nextVal = Math.max(0, Math.min(30, scoreB[setIdx] + delta))
            const newArr: [number, number, number] = [...scoreB]
            newArr[setIdx] = nextVal
            setScoreB(newArr)
            if (nextVal >= 20 && scoreA[setIdx] >= 20 && nextVal === scoreA[setIdx] && nextVal < 30) {
                setStatusLog('⚠️ JUS (DEUCE)! Mencari selisih 2 poin (Maksimal 30 Poin).')
            } else {
                setStatusLog('')
            }
        }
    }

    const handleAddCock = async () => {
        if (!window.confirm(`Tambah 1 Kok Baru (Rp10.000) untuk ${currentMatch.id}?\nBiaya otomatis dibagi 50:50 (@Rp5.000) ke masing-masing tim.`)) return

        setLoadingCock(true)
        try {
            if (token) {
                await fetch(`${import.meta.env.VITE_API_URL}/api/badminton/cock-usage/split`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        match_id: currentMatch.id,
                        team_a_id: currentMatch.teamA,
                        team_b_id: currentMatch.teamB,
                        set_number: currentSet,
                        quantity: 1
                    })
                })
            }
            setMatchCocks(prev => prev + 1)
            setStatusLog(`🏸 +1 Kok dicatat di Set ${currentSet}. Split @Rp5.000 ke ${currentMatch.teamA} & ${currentMatch.teamB}`)
            onCockUsed()
        } catch {
            alert('Gagal mencatat pemakaian kok')
        } finally {
            setLoadingCock(false)
        }
    }

    const handleResetMatch = () => {
        if (!window.confirm(`Reset seluruh skor dan pemakaian kok untuk ${currentMatch.id}?`)) return
        setScoreA([0, 0, 0])
        setScoreB([0, 0, 0])
        setCurrentSet(1)
        setMatchCocks(0)
        setStatusLog('Papan skor di-reset ke 0-0.')
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">Papan Wasit — Jadwal &amp; Skor</h1>
                    <p className="text-sm text-cream/50 mt-1">
                        Pilih match yang sedang berlangsung di lapangan untuk input skor dan penggunaan kok.
                    </p>
                </div>
                <button
                    onClick={handleResetMatch}
                    className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer transition-colors"
                >
                    Reset Match Ini
                </button>
            </div>

            {/* SELEKTOR JADWAL MATCH */}
            <div className="bg-night2 border border-cream/10 rounded-2xl p-4">
                <div className="font-mono text-xs font-bold text-gold uppercase tracking-wider mb-3">
                    Pilih Pertandingan (Schedule Matrix)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {SCHEDULE_DATA.map((m) => {
                        const isSelected = m.id === selectedMatchId
                        return (
                            <button
                                key={m.id}
                                onClick={() => handleSelectMatch(m.id)}
                                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-gradient-to-br from-gold/20 to-amber-500/10 border-gold shadow-md scale-[1.02]'
                                        : 'bg-night border-cream/10 hover:border-cream/30 text-cream/70'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
                                        isSelected ? 'bg-gold text-[#150B2E]' : 'bg-cream/10 text-cream'
                                    }`}>
                                        {m.id}
                                    </span>
                                    <span className="text-[10px] font-mono text-cream/50">{m.time}</span>
                                </div>
                                <div className="text-[10px] font-bold text-court truncate mb-0.5">{m.round}</div>
                                <div className="text-[11px] font-semibold text-cream truncate">{m.teamA}</div>
                                <div className="text-[10px] text-cream/40 uppercase text-center my-0.5">vs</div>
                                <div className="text-[11px] font-semibold text-cream truncate">{m.teamB}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* STATUS BANNER MATCH TERPILIH */}
            <div className="bg-gradient-to-r from-night2 via-[#1f153d] to-night2 border border-[#A78BFA]/30 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <span className="font-mono text-xs font-bold bg-[#A78BFA]/20 text-[#A78BFA] px-2.5 py-1 rounded-lg border border-[#A78BFA]/30">
                        {currentMatch.id} · {currentMatch.round} ({currentMatch.time} WIB)
                    </span>
                    <h2 className="text-lg font-bold text-white mt-2">
                        {currentMatch.teamA} <span className="text-gold font-normal">VS</span> {currentMatch.teamB}
                    </h2>
                </div>
                {isMatchEnded && matchWinnerName && (
                    <div className="bg-court/20 border border-court text-court px-4 py-2 rounded-xl text-xs font-bold animate-pulse">
                        🏆 PEMENANG: {matchWinnerName} ({setsWonA}-{setsWonB})
                    </div>
                )}
            </div>

            {/* SET SELECTOR */}
            <div className="flex justify-center items-center gap-3">
                {[1, 2, 3].map((setNum) => {
                    const sWinner = checkSetWinner(scoreA[setNum - 1], scoreB[setNum - 1])
                    return (
                        <button
                            key={setNum}
                            onClick={() => setCurrentSet(setNum as 1 | 2 | 3)}
                            className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                currentSet === setNum ? 'bg-gold text-[#150B2E] shadow-lg scale-105' : 'bg-night2 border border-cream/10 text-cream/70'
                            }`}
                        >
                            <span>SET {setNum}</span>
                            {sWinner && (
                                <span className="text-[10px] bg-black/40 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                                    {scoreA[setNum - 1]}-{scoreB[setNum - 1]}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* PAPAN SKOR 2 SISI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SISI TIM A */}
                <div className={`bg-night2 p-6 rounded-2xl border flex flex-col items-center shadow-lg transition-all ${
                    setsWonA === 2 ? 'border-gold bg-gold/5 shadow-[0_0_25px_rgba(234,179,8,0.2)]' : 'border-[#A78BFA]/30'
                }`}>
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="font-mono text-[11px] text-[#A78BFA] font-bold">TIM A</span>
                        <span className="font-mono text-xs text-gold font-bold">Menang: {setsWonA} Set</span>
                    </div>
                    <h2 className="text-lg font-bold text-white text-center line-clamp-2 min-h-[56px] flex items-center">
                        {currentMatch.teamA}
                    </h2>
                    <div className="text-8xl font-mono font-black text-gold my-4 drop-shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                        {scoreA[currentSet - 1]}
                    </div>
                    <div className="flex gap-2 w-full">
                        <button
                            disabled={isMatchEnded}
                            onClick={() => handleAddScore('A', 1)}
                            className="flex-1 py-4 bg-court/20 border border-court/40 text-court font-black text-2xl rounded-xl active:scale-95 disabled:opacity-30 cursor-pointer"
                        >
                            +1
                        </button>
                        <button
                            onClick={() => handleAddScore('A', -1)}
                            className="px-6 py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-black text-2xl rounded-xl active:scale-95 cursor-pointer"
                        >
                            -1
                        </button>
                    </div>
                </div>

                {/* SISI TIM B */}
                <div className={`bg-night2 p-6 rounded-2xl border flex flex-col items-center shadow-lg transition-all ${
                    setsWonB === 2 ? 'border-[#38BDF8] bg-[#38BDF8]/5 shadow-[0_0_25px_rgba(56,189,248,0.2)]' : 'border-[#38BDF8]/30'
                }`}>
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="font-mono text-[11px] text-[#38BDF8] font-bold">TIM B</span>
                        <span className="font-mono text-xs text-[#38BDF8] font-bold">Menang: {setsWonB} Set</span>
                    </div>
                    <h2 className="text-lg font-bold text-white text-center line-clamp-2 min-h-[56px] flex items-center">
                        {currentMatch.teamB}
                    </h2>
                    <div className="text-8xl font-mono font-black text-[#38BDF8] my-4 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                        {scoreB[currentSet - 1]}
                    </div>
                    <div className="flex gap-2 w-full">
                        <button
                            disabled={isMatchEnded}
                            onClick={() => handleAddScore('B', 1)}
                            className="flex-1 py-4 bg-court/20 border border-court/40 text-court font-black text-2xl rounded-xl active:scale-95 disabled:opacity-30 cursor-pointer"
                        >
                            +1
                        </button>
                        <button
                            onClick={() => handleAddScore('B', -1)}
                            className="px-6 py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-black text-2xl rounded-xl active:scale-95 cursor-pointer"
                        >
                            -1
                        </button>
                    </div>
                </div>
            </div>

            {/* PENCATATAN SHUTTLECOCK */}
            <div className="max-w-md mx-auto w-full pt-2">
                <button
                    disabled={loadingCock}
                    onClick={handleAddCock}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-[#150B2E] font-black text-sm uppercase tracking-wider active:scale-95 shadow-xl hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <span>🏸 +1 KOK BARU (RP10.000)</span>
                    <span className="bg-black/20 text-white px-2.5 py-0.5 rounded text-[11px] font-mono font-bold">Split @Rp5.000</span>
                </button>
                <div className="text-center font-mono text-[11px] text-cream/50 mt-2">
                    Total Kok Dipakai ({currentMatch.id}): <b className="text-gold">{matchCocks}</b> (Biaya: Rp{(matchCocks * 10000).toLocaleString('id-ID')})
                </div>
                {statusLog && (
                    <div className="text-center font-mono text-xs text-amber-300 mt-2 animate-pulse">
                        {statusLog}
                    </div>
                )}
            </div>
        </div>
    )
}