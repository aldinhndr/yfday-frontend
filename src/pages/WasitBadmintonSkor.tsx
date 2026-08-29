// src/pages/WasitBadmintonSkor.tsx
import React, { useState } from 'react';

interface TeamMatchState {
  id: string;
  name: string;
  score: [number, number, number];
  setsWon: number;
}

export default function WasitBadmintonSkor() {
  const [currentSet, setCurrentSet] = useState<1 | 2 | 3>(1);
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);

  const [teamA, setTeamA] = useState<TeamMatchState>({
    id: 'team-a-uuid',
    name: 'Ganda Putra A',
    score: [0, 0, 0],
    setsWon: 0,
  });

  const [teamB, setTeamB] = useState<TeamMatchState>({
    id: 'team-b-uuid',
    name: 'Ganda Putra B',
    score: [0, 0, 0],
    setsWon: 0,
  });

  const [totalMatchCocks, setTotalMatchCocks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusLog, setStatusLog] = useState('');

  // Aturan BWF: 21 poin, deuce mencari selisih 2, maksimal batas 30 poin
  const checkSetWinner = (scoreA: number, scoreB: number): 'A' | 'B' | null => {
    if (scoreA === 30) return 'A';
    if (scoreB === 30) return 'B';
    if (scoreA >= 21 && scoreA - scoreB >= 2) return 'A';
    if (scoreB >= 21 && scoreB - scoreA >= 2) return 'B';
    return null;
  };

  const handleAddScore = (side: 'A' | 'B', delta: number) => {
    if (matchCompleted && delta > 0) {
      alert('Pertandingan sudah selesai. Silakan reset jika ingin memulai match baru.');
      return;
    }

    const setIdx = currentSet - 1;
    let newScoreA = teamA.score[setIdx];
    let newScoreB = teamB.score[setIdx];

    if (side === 'A') {
      newScoreA = Math.max(0, Math.min(30, newScoreA + delta));
    } else {
      newScoreB = Math.max(0, Math.min(30, newScoreB + delta));
    }

    const updatedScoreA: [number, number, number] = [...teamA.score];
    const updatedScoreB: [number, number, number] = [...teamB.score];
    updatedScoreA[setIdx] = newScoreA;
    updatedScoreB[setIdx] = newScoreB;

    // Evaluasi deuce/jus
    if (newScoreA >= 20 && newScoreB >= 20 && newScoreA === newScoreB && newScoreA < 30) {
      setStatusLog('⚠️ JUS (DEUCE)! Mencari selisih 2 poin (Maksimal 30 Poin).');
    } else {
      setStatusLog('');
    }

    // Hitung total kemenangan set
    let setsA = 0;
    let setsB = 0;
    for (let i = 0; i < 3; i++) {
      const w = checkSetWinner(updatedScoreA[i], updatedScoreB[i]);
      if (w === 'A') setsA++;
      if (w === 'B') setsB++;
    }

    setTeamA((prev) => ({ ...prev, score: updatedScoreA, setsWon: setsA }));
    setTeamB((prev) => ({ ...prev, score: updatedScoreB, setsWon: setsB }));

    // Cek Best of 3
    if (setsA === 2) {
      setMatchCompleted(true);
      setMatchWinner(teamA.name);
      setStatusLog(`🏆 PERTANDINGAN SELESAI: ${teamA.name} Menang (2-${setsB})!`);
    } else if (setsB === 2) {
      setMatchCompleted(true);
      setMatchWinner(teamB.name);
      setStatusLog(`🏆 PERTANDINGAN SELESAI: ${teamB.name} Menang (2-${setsA})!`);
    } else {
      const currentSetWinner = checkSetWinner(newScoreA, newScoreB);
      if (currentSetWinner && currentSet < 3) {
        const winnerName = currentSetWinner === 'A' ? teamA.name : teamB.name;
        setStatusLog(`Set ${currentSet} selesai dimenangkan oleh ${winnerName}. Silakan beralih ke Set ${currentSet + 1}.`);
      }
    }
  };

  const handleAddSharedCock = async () => {
    const confirmMsg = `Tambah 1 Kok Baru (Rp10.000)?\nSaldo deposit ${teamA.name} & ${teamB.name} masing-masing akan terpotong Rp5.000.`;
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      setTotalMatchCocks((prev) => prev + 1);
      setStatusLog(`🏸 +1 Kok Baru dicatat (Set ${currentSet}): ${teamA.name} (-Rp5.000) & ${teamB.name} (-Rp5.000)`);
    } catch {
      alert('Gagal mencatat penggunaan kok');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMatch = () => {
    if (!window.confirm('Reset skor pertandingan ini ke 0-0?')) return;
    setTeamA({ id: 'team-a-uuid', name: 'Ganda Putra A', score: [0, 0, 0], setsWon: 0 });
    setTeamB({ id: 'team-b-uuid', name: 'Ganda Putra B', score: [0, 0, 0], setsWon: 0 });
    setCurrentSet(1);
    setTotalMatchCocks(0);
    setMatchCompleted(false);
    setMatchWinner(null);
    setStatusLog('Skor di-reset.');
  };

  return (
    <div className="min-h-screen bg-[#0a0716] text-[#EDE9FE] font-sans p-4 sm:p-6 flex flex-col justify-between select-none">
      {/* HEADER WASIT */}
      <header className="text-center mb-2">
        <div className="font-mono text-xs text-[#A78BFA] uppercase tracking-widest">Papan Wasit Lapangan</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">BADMINTON SCORER &amp; KOK</h1>

        {/* SELECTOR SET */}
        <div className="flex items-center justify-center gap-3 mt-3">
          {[1, 2, 3].map((setNum) => {
            const sWinner = checkSetWinner(teamA.score[setNum - 1], teamB.score[setNum - 1]);
            return (
              <button
                key={setNum}
                onClick={() => setCurrentSet(setNum as 1 | 2 | 3)}
                className={`px-5 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  currentSet === setNum
                    ? 'bg-amber-400 text-[#150B2E] shadow-lg scale-105'
                    : 'bg-white/10 text-[#b3aecb] hover:bg-white/15'
                }`}
              >
                <span>SET {setNum}</span>
                {sWinner && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    sWinner === 'A' ? 'bg-violet-900 text-white' : 'bg-sky-900 text-white'
                  }`}>
                    {teamA.score[setNum - 1]}-{teamB.score[setNum - 1]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* BANNER JUARA JIKA SELESAI */}
      {matchWinner && (
        <div className="max-w-md mx-auto w-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-center py-2 px-4 rounded-xl font-bold text-sm my-2 animate-bounce">
          🎉 PEMENANG: {matchWinner} (Skor Set {teamA.setsWon} - {teamB.setsWon})
        </div>
      )}

      {/* PAPAN SKOR DUA TIM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full my-auto">
        {/* TIM A */}
        <div className={`border rounded-2xl p-6 flex flex-col items-center shadow-xl backdrop-blur-md transition-all ${
          teamA.setsWon === 2 ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_25px_rgba(167,139,250,0.2)]' : 'bg-white/5 border-[#A78BFA]/30'
        }`}>
          <div className="flex justify-between items-center w-full mb-1">
            <span className="font-mono text-[11px] text-[#A78BFA] uppercase tracking-wider font-bold">TIM A</span>
            <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-amber-300 font-bold">
              Menang: {teamA.setsWon} Set
            </span>
          </div>

          <h2 className="text-xl font-black text-white text-center truncate max-w-full">{teamA.name}</h2>

          <div className="text-8xl font-mono font-black text-amber-300 my-3 drop-shadow-[0_0_20px_rgba(167,139,250,0.3)]">
            {teamA.score[currentSet - 1]}
          </div>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => handleAddScore('A', 1)}
              disabled={matchCompleted}
              className="flex-1 py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-2xl rounded-xl active:scale-95 disabled:opacity-30 cursor-pointer hover:bg-emerald-500/30"
            >
              +1
            </button>
            <button
              onClick={() => handleAddScore('A', -1)}
              className="px-5 py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-black text-2xl rounded-xl active:scale-95 cursor-pointer hover:bg-red-500/30"
            >
              -1
            </button>
          </div>
        </div>

        {/* TIM B */}
        <div className={`border rounded-2xl p-6 flex flex-col items-center shadow-xl backdrop-blur-md transition-all ${
          teamB.setsWon === 2 ? 'bg-[#38BDF8]/10 border-[#38BDF8] shadow-[0_0_25px_rgba(56,189,248,0.2)]' : 'bg-white/5 border-[#38BDF8]/30'
        }`}>
          <div className="flex justify-between items-center w-full mb-1">
            <span className="font-mono text-[11px] text-[#38BDF8] uppercase tracking-wider font-bold">TIM B</span>
            <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-[#38BDF8] font-bold">
              Menang: {teamB.setsWon} Set
            </span>
          </div>

          <h2 className="text-xl font-black text-white text-center truncate max-w-full">{teamB.name}</h2>

          <div className="text-8xl font-mono font-black text-[#38BDF8] my-3 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            {teamB.score[currentSet - 1]}
          </div>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => handleAddScore('B', 1)}
              disabled={matchCompleted}
              className="flex-1 py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-2xl rounded-xl active:scale-95 disabled:opacity-30 cursor-pointer hover:bg-emerald-500/30"
            >
              +1
            </button>
            <button
              onClick={() => handleAddScore('B', -1)}
              className="px-5 py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-black text-2xl rounded-xl active:scale-95 cursor-pointer hover:bg-red-500/30"
            >
              -1
            </button>
          </div>
        </div>
      </div>

      {/* KONTROL PEMAKAIAN KOK & RESET */}
      <div className="max-w-md mx-auto w-full mb-2 flex flex-col gap-2">
        <button
          onClick={handleAddSharedCock}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-[#150B2E] font-black text-sm uppercase tracking-wider active:scale-95 shadow-2xl hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <span>🏸 +1 KOK BARU (RP10.000)</span>
          <span className="bg-black/20 text-white px-2.5 py-0.5 rounded text-[11px] font-mono font-bold">Split @Rp5.000</span>
        </button>
        <div className="flex justify-between items-center text-xs font-mono text-[#b3aecb] px-1">
          <span>Total Kok: <b className="text-amber-300">{totalMatchCocks}</b> (Rp{(totalMatchCocks * 10000).toLocaleString('id-ID')})</span>
          <button onClick={handleResetMatch} className="text-red-400/80 hover:text-red-300 underline cursor-pointer">
            Reset Match
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center font-mono text-xs text-amber-300 min-h-[18px]">
        {statusLog || 'BWF Standard: 21 Poin (Jus s/d 30) • Best of 3 Sets'}
      </footer>
    </div>
  );
}