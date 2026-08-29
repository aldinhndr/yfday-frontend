// src/pages/AdminRollingPes.tsx
import React, { useState, useEffect, useRef } from 'react';
import NavbarSimple from '../components/NavbarLogo';

interface SlotData {
    name: string;
    slots: 1 | 2;
    color?: string;
}

interface HistoryItem {
    name: string;
    slots: 1 | 2;
    positions: { side: 'left' | 'right'; num: number }[];
    color?: string;
    time: Date;
}

const PALETTE = ['#A78BFA', '#38BDF8', '#F56565', '#63B3ED', '#C084FC', '#68D391', '#F6AD55', '#FC8181', '#76E4F7', '#F687B3', '#FBB6CE', '#818CF8'];

export default function AdminRollingPes() {
    const [isSetup, setIsSetup] = useState(true);
    const [totalSlotsInput, setTotalSlotsInput] = useState('');
    const [setupError, setSetupError] = useState('');

    const [totalSlots, setTotalSlots] = useState(0);
    const [halfSize, setHalfSize] = useState(0);
    const [leftAvail, setLeftAvail] = useState<number[]>([]);
    const [rightAvail, setRightAvail] = useState<number[]>([]);
    const [leftFilled, setLeftFilled] = useState<Record<number, SlotData>>({});
    const [rightFilled, setRightFilled] = useState<Record<number, SlotData>>({});
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const [teamName, setTeamName] = useState('');
    const [slotCount, setSlotCount] = useState<1 | 2>(1);
    const [isRolling, setIsRolling] = useState(false);
    const [statusLine, setStatusLine] = useState('');
    const [opponentCallout, setOpponentCallout] = useState('');
    const [showTicker, setShowTicker] = useState(false);

    const [reelLeftActive, setReelLeftActive] = useState(false);
    const [reelRightActive, setReelRightActive] = useState(false);
    const [numLeft, setNumLeft] = useState('--');
    const [numRight, setNumRight] = useState('--');
    const [settledLeft, setSettledLeft] = useState(false);
    const [settledRight, setSettledRight] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        channelRef.current = new BroadcastChannel('pes_tournament_sync');
        return () => channelRef.current?.close();
    }, []);

    const broadcastState = (extra?: any) => {
        const payload = {
            type: 'SYNC_STATE',
            isSetup,
            totalSlots,
            halfSize,
            leftFilled,
            rightFilled,
            history,
            showTicker,
            ...extra
        };
        channelRef.current?.postMessage(payload);
        localStorage.setItem('pes_bracket_live', JSON.stringify(payload));
    };

    const toggleTicker = () => {
        const nextState = !showTicker;
        setShowTicker(nextState);
        broadcastState({ showTicker: nextState });
    };

    const handleStartDraw = () => {
        const val = parseInt(totalSlotsInput, 10);
        if (!val || val < 2 || val % 2 !== 0) {
            setSetupError('Masukkan jumlah slot genap (minimal 2).');
            return;
        }
        setSetupError('');
        const half = val / 2;
        setTotalSlots(val);
        setHalfSize(half);
        setLeftAvail(Array.from({ length: half }, (_, i) => i + 1));
        setRightAvail(Array.from({ length: half }, (_, i) => i + 1));
        setLeftFilled({});
        setRightFilled({});
        setHistory([]);
        setIsSetup(false);

        const payload = {
            type: 'SYNC_STATE',
            isSetup: false,
            totalSlots: val,
            halfSize: half,
            leftFilled: {},
            rightFilled: {},
            history: [],
            showTicker
        };
        channelRef.current?.postMessage(payload);
        localStorage.setItem('pes_bracket_live', JSON.stringify(payload));

        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    const finalizeEntry = (name: string, slots: 1 | 2, positions: { side: 'left' | 'right'; num: number }[]) => {
        const color = slots === 2 ? PALETTE[history.length % PALETTE.length] : undefined;
        const nextLeft = { ...leftFilled };
        const nextRight = { ...rightFilled };

        positions.forEach(p => {
            if (p.side === 'left') nextLeft[p.num] = { name, slots, color };
            else nextRight[p.num] = { name, slots, color };
        });

        const newHistory = [{ name, slots, positions, color, time: new Date() }, ...history];
        setLeftFilled(nextLeft);
        setRightFilled(nextRight);
        setHistory(newHistory);

        // Hitung Lawan
        const details = positions.map(p => {
            const store = p.side === 'left' ? nextLeft : nextRight;
            const partner = p.num % 2 === 1 ? p.num + 1 : p.num - 1;
            const sideLabel = p.side === 'left' ? 'Kiri' : 'Kanan';
            let oppText = '';
            if (partner > halfSize) {
                oppText = 'BYE — otomatis lanjut ronde berikutnya';
            } else {
                const partnerData = store[partner];
                oppText = partnerData ? `lawan ${partnerData.name}` : 'menunggu lawan…';
            }
            return `${sideLabel} #${String(p.num).padStart(2, '0')} — ${oppText}`;
        });
        const calloutMsg = details.join('   •   ');
        setOpponentCallout(calloutMsg);

        broadcastState({
            leftFilled: nextLeft,
            rightFilled: nextRight,
            history: newHistory,
            lastPositions: positions,
            opponentCallout: calloutMsg
        });

        setTeamName('');
        nameInputRef.current?.focus();
    };

    const triggerRoll = () => {
        if (isRolling) return;
        const name = teamName.trim();
        if (!name) return;

        if (slotCount === 1) {
            const combined: { side: 'left' | 'right'; num: number }[] = [];
            leftAvail.forEach(n => combined.push({ side: 'left', num: n }));
            rightAvail.forEach(n => combined.push({ side: 'right', num: n }));
            if (combined.length === 0) return setStatusLine('Bagan sudah penuh.');

            const choice = combined[Math.floor(Math.random() * combined.length)];
            if (choice.side === 'left') setLeftAvail(prev => prev.filter(n => n !== choice.num));
            else setRightAvail(prev => prev.filter(n => n !== choice.num));

            // Animasi 1 Slot
            setIsRolling(true);
            setStatusLine('MENGUNDI SLOT…');
            setReelLeftActive(choice.side === 'left');
            setReelRightActive(choice.side === 'right');

            let ticks = 0;
            const timer = setInterval(() => {
                ticks++;
                const randStr = String(Math.floor(Math.random() * halfSize) + 1).padStart(2, '0');
                if (choice.side === 'left') setNumLeft(randStr);
                else setNumRight(randStr);

                if (ticks >= 16) {
                    clearInterval(timer);
                    const finalStr = String(choice.num).padStart(2, '0');
                    if (choice.side === 'left') { setNumLeft(finalStr); setSettledLeft(true); }
                    else { setNumRight(finalStr); setSettledRight(true); }
                    setStatusLine(`${choice.side === 'left' ? 'KIRI' : 'KANAN'} #${finalStr}`);

                    setTimeout(() => {
                        setSettledLeft(false);
                        setSettledRight(false);
                        setIsRolling(false);
                        finalizeEntry(name, 1, [choice]);
                    }, 500);
                }
            }, 70);

        } else {
            if (leftAvail.length === 0 || rightAvail.length === 0) {
                return setStatusLine('Slot kiri/kanan tidak cukup untuk tim 2 slot.');
            }
            const idxL = Math.floor(Math.random() * leftAvail.length);
            const leftVal = leftAvail[idxL];
            const newL = [...leftAvail]; newL.splice(idxL, 1);

            const idxR = Math.floor(Math.random() * rightAvail.length);
            const rightVal = rightAvail[idxR];
            const newR = [...rightAvail]; newR.splice(idxR, 1);

            setLeftAvail(newL);
            setRightAvail(newR);

            // Animasi 2 Slot
            setIsRolling(true);
            setStatusLine('MENGUNDI — DIPISAH KE KIRI & KANAN…');
            setReelLeftActive(true);
            setReelRightActive(true);

            let ticks = 0;
            let leftDone = false, rightDone = false;
            const timer = setInterval(() => {
                ticks++;
                if (ticks <= 14) setNumLeft(String(Math.floor(Math.random() * halfSize) + 1).padStart(2, '0'));
                if (ticks <= 19) setNumRight(String(Math.floor(Math.random() * halfSize) + 1).padStart(2, '0'));

                if (ticks === 14) { setNumLeft(String(leftVal).padStart(2, '0')); setSettledLeft(true); leftDone = true; }
                if (ticks === 19) { setNumRight(String(rightVal).padStart(2, '0')); setSettledRight(true); rightDone = true; }

                if (leftDone && rightDone) {
                    clearInterval(timer);
                    setStatusLine(`KIRI #${String(leftVal).padStart(2, '0')}  &  KANAN #${String(rightVal).padStart(2, '0')}`);
                    setTimeout(() => {
                        setSettledLeft(false);
                        setSettledRight(false);
                        setIsRolling(false);
                        finalizeEntry(name, 2, [{ side: 'left', num: leftVal }, { side: 'right', num: rightVal }]);
                    }, 550);
                }
            }, 70);
        }
    };

    const undoLast = () => {
        if (history.length === 0 || isRolling) return;
        const [last, ...restHistory] = history;

        const nextLeft = { ...leftFilled };
        const nextRight = { ...rightFilled };
        last.positions.forEach(p => {
            if (p.side === 'left') delete nextLeft[p.num];
            else delete nextRight[p.num];
        });

        last.positions.forEach(p => {
            if (p.side === 'left') {
                setLeftAvail(prev => [...prev, p.num].sort((a, b) => a - b));
            } else {
                setRightAvail(prev => [...prev, p.num].sort((a, b) => a - b));
            }
        });

        setLeftFilled(nextLeft);
        setRightFilled(nextRight);
        setHistory(restHistory);

        broadcastState({
            leftFilled: nextLeft,
            rightFilled: nextRight,
            history: restHistory,
            lastPositions: [],
            opponentCallout: ''
        });
    };

    const handleResetAll = () => {
        if (!window.confirm('Reset semua undian dan kembali ke pengaturan awal?')) return;
        setIsSetup(true);
        setTotalSlotsInput('');
        setNumLeft('--');
        setNumRight('--');
        setReelLeftActive(false);
        setReelRightActive(false);
        setStatusLine('');
        setOpponentCallout('');

        broadcastState({
            isSetup: true,
            totalSlots: 0,
            halfSize: 0,
            leftFilled: {},
            rightFilled: {},
            history: [],
            lastPositions: [],
            opponentCallout: ''
        });
    };

    const handleOpenStageWindow = () => {
        window.open('/stage/pes', '_blank', 'width=1280,height=720');
    };

    return (
        <div className="min-h-screen bg-[#150B2E] text-[#EDE9FE] font-sans pb-20">
            <NavbarSimple />

            <div className="max-w-[1180px] mx-auto px-5 pt-28 sm:pt-32">
                <header className="text-center mb-8 relative flex flex-col items-center">
                    <div className="w-full flex justify-end gap-3 mb-2 sm:mb-0 sm:absolute sm:right-0 sm:top-0">
                        <button
                            type="button"
                            onClick={toggleTicker}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg backdrop-blur-sm border ${showTicker
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-white/5 border-white/20 text-cream/60 hover:text-white'
                                }`}
                        >
                            📢 {showTicker ? 'Running Text' : 'Munculkan Running Text'}
                        </button>
                        <button
                            onClick={handleOpenStageWindow}
                            className="px-4 py-2 bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] rounded-xl text-xs font-bold hover:bg-[#38BDF8]/30 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                        >
                            🖥️ Buka Layar 2 (Proyektor) ↗
                        </button>
                    </div>
                    <div className="font-mono text-xs tracking-[0.28em] text-[#A78BFA] uppercase">YouthFunDay · Controller</div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Rolling <span className="text-[#A78BFA]">Peserta</span></h1>
                </header>

                {isSetup ? (
                    <section className="max-w-[420px] mx-auto bg-white/5 border border-[#A78BFA]/20 rounded-2xl p-8 text-center mt-6">
                        <label className="block text-xs text-[#b3aecb] uppercase tracking-wider mb-2 font-bold">Total Slot Bagan</label>
                        <input
                            type="number"
                            step="2"
                            placeholder="cth. 22"
                            value={totalSlotsInput}
                            onChange={e => setTotalSlotsInput(e.target.value)}
                            className="w-full p-3.5 rounded-xl border border-[#A78BFA]/20 bg-black/30 text-2xl text-center font-mono font-bold text-white focus:outline-none focus:border-[#A78BFA]"
                        />
                        {setupError && <div className="text-red-400 text-xs mt-2">{setupError}</div>}
                        <button onClick={handleStartDraw} className="mt-5 w-full p-3.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#38BDF8] text-[#150B2E] font-bold cursor-pointer hover:brightness-105 transition-all">
                            Mulai Rolling
                        </button>
                    </section>
                ) : (
                    <section className="space-y-6">
                        <div className="bg-white/5 border border-[#A78BFA]/20 rounded-2xl p-6">
                            <div className="flex flex-wrap gap-3 items-center">
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    placeholder="Ketik nama tim, tekan Spasi / Enter untuk roll…"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); triggerRoll(); } }}
                                    disabled={isRolling}
                                    className="flex-1 min-w-[220px] p-3.5 rounded-xl border border-[#A78BFA]/20 bg-black/30 text-white font-semibold focus:outline-none focus:border-[#A78BFA]"
                                />
                                <div className="flex border border-[#A78BFA]/20 rounded-xl overflow-hidden">
                                    <button onClick={() => setSlotCount(1)} className={`px-4 py-3.5 text-xs font-bold cursor-pointer transition-colors ${slotCount === 1 ? 'bg-[#A78BFA] text-[#150B2E]' : 'text-[#b3aecb]'}`}>1 SLOT</button>
                                    <button onClick={() => setSlotCount(2)} className={`px-4 py-3.5 text-xs font-bold cursor-pointer transition-colors ${slotCount === 2 ? 'bg-[#A78BFA] text-[#150B2E]' : 'text-[#b3aecb]'}`}>2 SLOT</button>
                                </div>
                                <button onClick={triggerRoll} disabled={isRolling || !teamName.trim()} className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#38BDF8] text-[#150B2E] font-bold cursor-pointer hover:brightness-105 disabled:opacity-50 transition-all">
                                    ROLL
                                </button>
                            </div>

                            <div className="flex justify-center gap-12 py-6 items-center">
                                <div className={`text-center transition-all ${reelLeftActive ? 'opacity-100' : 'opacity-25'}`}>
                                    <span className="font-mono text-xs text-[#38BDF8]">KIRI</span>
                                    <div className={`text-5xl font-mono font-bold text-[#A78BFA] ${settledLeft ? 'animate-pulse' : ''}`}>{numLeft}</div>
                                </div>
                                <div className={`text-center transition-all ${reelRightActive ? 'opacity-100' : 'opacity-25'}`}>
                                    <span className="font-mono text-xs text-[#38BDF8]">KANAN</span>
                                    <div className={`text-5xl font-mono font-bold text-[#A78BFA] ${settledRight ? 'animate-pulse' : ''}`}>{numRight}</div>
                                </div>
                            </div>

                            <div className="text-center font-mono text-xs text-[#b3aecb] uppercase">{statusLine || '\u00A0'}</div>
                            <div className="text-center font-mono text-xs text-[#A78BFA] mt-1 font-bold">{opponentCallout || '\u00A0'}</div>
                        </div>

                        {/* STATUS REKAP & RIWAYAT */}
                        <div className="flex justify-between font-mono text-xs text-[#b3aecb] px-2">
                            <span>Sisa Kiri: <b className="text-[#A78BFA]">{leftAvail.length}</b></span>
                            <span>Total: {totalSlots} Slot</span>
                            <span>Sisa Kanan: <b className="text-[#A78BFA]">{rightAvail.length}</b></span>
                        </div>

                        {/* RIWAYAT PENGUNDIAN */}
                        <div className="bg-white/5 border border-[#A78BFA]/20 rounded-2xl p-6">
                            <div className="font-mono text-xs tracking-[0.24em] text-[#38BDF8] uppercase font-bold mb-3">
                                Riwayat Undian
                            </div>

                            {history.length === 0 ? (
                                <div className="text-center text-[#b3aecb] text-xs py-4">Belum ada peserta di-roll.</div>
                            ) : (
                                <div className="divide-y divide-[#A78BFA]/20">
                                    {history.map((h, idx) => (
                                        <div key={`${h.name}-${idx}`} className="flex justify-between items-center py-2.5 text-xs">
                                            <div>
                                                <div className="font-bold text-sm text-[#EDE9FE]">
                                                    {h.name} <span className="text-[11px] font-normal text-[#b3aecb]">({h.slots} slot)</span>
                                                </div>
                                                <div className="font-mono text-[#A78BFA] text-[11px] mt-0.5">
                                                    {h.positions.map(p => `${p.side === 'left' ? 'KIRI' : 'KANAN'} #${String(p.num).padStart(2, '0')}`).join('  +  ')}
                                                </div>
                                            </div>
                                            {idx === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={undoLast}
                                                    disabled={isRolling}
                                                    className="px-2.5 py-1 rounded-lg border border-[#A78BFA]/30 text-[#b3aecb] hover:border-red-400 hover:text-red-400 transition-colors text-[11px] cursor-pointer"
                                                >
                                                    Undo
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end mt-4 pt-3 border-t border-[#A78BFA]/10">
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="px-4 py-2 rounded-xl border border-[#A78BFA]/30 text-[#b3aecb] text-xs font-semibold hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                    Reset Semua
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}