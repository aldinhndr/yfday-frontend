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

const PALETTE = [
    '#A78BFA', '#38BDF8', '#F56565', '#63B3ED', '#C084FC',
    '#68D391', '#F6AD55', '#FC8181', '#76E4F7', '#F687B3', '#FBB6CE', '#818CF8'
];

export default function AdminRollingPes() {
    // Setup State
    const [isSetup, setIsSetup] = useState(true);
    const [totalSlotsInput, setTotalSlotsInput] = useState<string>('');
    const [setupError, setSetupError] = useState<string>('');

    // Game/Tournament State
    const [totalSlots, setTotalSlots] = useState<number>(0);
    const [halfSize, setHalfSize] = useState<number>(0);
    const [leftAvail, setLeftAvail] = useState<number[]>([]);
    const [rightAvail, setRightAvail] = useState<number[]>([]);
    const [leftFilled, setLeftFilled] = useState<Record<number, SlotData>>({});
    const [rightFilled, setRightFilled] = useState<Record<number, SlotData>>({});
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Controls & Animation State
    const [teamName, setTeamName] = useState('');
    const [slotCount, setSlotCount] = useState<1 | 2>(1);
    const [isRolling, setIsRolling] = useState(false);
    const [statusLine, setStatusLine] = useState('');

    // Reel Displays
    const [reelLeftActive, setReelLeftActive] = useState(false);
    const [reelRightActive, setReelRightActive] = useState(false);
    const [numLeft, setNumLeft] = useState('--');
    const [numRight, setNumRight] = useState('--');
    const [settledLeft, setSettledLeft] = useState(false);
    const [settledRight, setSettledRight] = useState(false);

    // Tree Visibility
    const [showTree, setShowTree] = useState(true);

    // Refs
    const nameInputRef = useRef<HTMLInputElement>(null);
    const totalInputRef = useRef<HTMLInputElement>(null);
    const bracketLeftRef = useRef<HTMLDivElement>(null);
    const bracketRightRef = useRef<HTMLDivElement>(null);

    // Focus setup input on mount
    useEffect(() => {
        if (isSetup) {
            totalInputRef.current?.focus();
        }
    }, [isSetup]);

    // Start tournament draw
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

        setTimeout(() => {
            nameInputRef.current?.focus();
        }, 100);
    };

    const pickRandom = (arr: number[]): { val: number; newArr: number[] } => {
        const idx = Math.floor(Math.random() * arr.length);
        const val = arr[idx];
        const newArr = [...arr];
        newArr.splice(idx, 1);
        return { val, newArr };
    };

    const finalizeEntry = (
        name: string,
        slots: 1 | 2,
        positions: { side: 'left' | 'right'; num: number }[]
    ) => {
        const color = slots === 2 ? PALETTE[history.length % PALETTE.length] : undefined;

        setLeftFilled(prev => {
            const next = { ...prev };
            positions.filter(p => p.side === 'left').forEach(p => {
                next[p.num] = { name, slots, color };
            });
            return next;
        });

        setRightFilled(prev => {
            const next = { ...prev };
            positions.filter(p => p.side === 'right').forEach(p => {
                next[p.num] = { name, slots, color };
            });
            return next;
        });

        setHistory(prev => [{ name, slots, positions, color, time: new Date() }, ...prev]);
        setTeamName('');
        nameInputRef.current?.focus();
    };

    const animateOne = (
        choice: { side: 'left' | 'right'; num: number },
        onComplete: () => void
    ) => {
        setIsRolling(true);
        setStatusLine('MENGUNDI SLOT…');
        setSettledLeft(false);
        setSettledRight(false);

        if (choice.side === 'left') {
            setReelLeftActive(true);
            setReelRightActive(false);
        } else {
            setReelLeftActive(false);
            setReelRightActive(true);
        }

        let ticks = 0;
        const maxTicks = 16;
        const timer = setInterval(() => {
            ticks++;
            const randStr = String(Math.floor(Math.random() * halfSize) + 1).padStart(2, '0');
            if (choice.side === 'left') setNumLeft(randStr);
            else setNumRight(randStr);

            if (ticks >= maxTicks) {
                clearInterval(timer);
                const finalStr = String(choice.num).padStart(2, '0');
                if (choice.side === 'left') {
                    setNumLeft(finalStr);
                    setSettledLeft(true);
                } else {
                    setNumRight(finalStr);
                    setSettledRight(true);
                }

                setStatusLine(`${choice.side === 'left' ? 'KIRI' : 'KANAN'} #${finalStr}`);

                setTimeout(() => {
                    setSettledLeft(false);
                    setSettledRight(false);
                    setIsRolling(false);
                    onComplete();
                }, 500);
            }
        }, 70);
    };

    const animateTwo = (
        leftNum: number,
        rightNum: number,
        onComplete: () => void
    ) => {
        setIsRolling(true);
        setStatusLine('MENGUNDI — DIPISAH KE KIRI & KANAN…');
        setReelLeftActive(true);
        setReelRightActive(true);
        setSettledLeft(false);
        setSettledRight(false);

        let ticks = 0;
        const leftStop = 14;
        const rightStop = 19;
        let leftDone = false;
        let rightDone = false;

        const timer = setInterval(() => {
            ticks++;
            if (ticks <= leftStop) {
                setNumLeft(String(Math.floor(Math.random() * halfSize) + 1).padStart(2, '0'));
            }
            if (ticks <= rightStop) {
                setNumRight(String(Math.floor(Math.random() * halfSize) + 1).padStart(2, '0'));
            }

            if (ticks === leftStop) {
                setNumLeft(String(leftNum).padStart(2, '0'));
                setSettledLeft(true);
                leftDone = true;
            }
            if (ticks === rightStop) {
                setNumRight(String(rightNum).padStart(2, '0'));
                setSettledRight(true);
                rightDone = true;
            }

            if (leftDone && rightDone) {
                clearInterval(timer);
                setStatusLine(`KIRI #${String(leftNum).padStart(2, '0')}  &  KANAN #${String(rightNum).padStart(2, '0')}`);
                setTimeout(() => {
                    setSettledLeft(false);
                    setSettledRight(false);
                    setIsRolling(false);
                    onComplete();
                }, 550);
            }
        }, 70);
    };

    const handleRoll = () => {
        if (isRolling) return;
        const name = teamName.trim();
        if (!name) {
            nameInputRef.current?.classList.add('border-red-400');
            setTimeout(() => nameInputRef.current?.classList.remove('border-red-400'), 350);
            return;
        }

        if (slotCount === 1) {
            const combined: { side: 'left' | 'right'; num: number }[] = [];
            leftAvail.forEach(n => combined.push({ side: 'left', num: n }));
            rightAvail.forEach(n => combined.push({ side: 'right', num: n }));

            if (combined.length === 0) {
                setStatusLine('Bagan sudah penuh.');
                return;
            }

            const choice = combined[Math.floor(Math.random() * combined.length)];
            if (choice.side === 'left') {
                setLeftAvail(prev => prev.filter(n => n !== choice.num));
            } else {
                setRightAvail(prev => prev.filter(n => n !== choice.num));
            }

            animateOne(choice, () => finalizeEntry(name, 1, [choice]));
        } else {
            if (leftAvail.length === 0 || rightAvail.length === 0) {
                setStatusLine('Slot kiri/kanan tidak cukup untuk tim 2 slot.');
                return;
            }

            const pickL = pickRandom(leftAvail);
            const pickR = pickRandom(rightAvail);
            setLeftAvail(pickL.newArr);
            setRightAvail(pickR.newArr);

            animateTwo(pickL.val, pickR.val, () => {
                finalizeEntry(name, 2, [
                    { side: 'left', num: pickL.val },
                    { side: 'right', num: pickR.val }
                ]);
            });
        }
    };

    const undoLast = () => {
        if (history.length === 0 || isRolling) return;
        const [last, ...restHistory] = history;

        setLeftFilled(prev => {
            const next = { ...prev };
            last.positions.filter(p => p.side === 'left').forEach(p => {
                delete next[p.num];
            });
            return next;
        });

        setRightFilled(prev => {
            const next = { ...prev };
            last.positions.filter(p => p.side === 'right').forEach(p => {
                delete next[p.num];
            });
            return next;
        });

        last.positions.forEach(p => {
            if (p.side === 'left') {
                setLeftAvail(prev => [...prev, p.num].sort((a, b) => a - b));
            } else {
                setRightAvail(prev => [...prev, p.num].sort((a, b) => a - b));
            }
        });

        setHistory(restHistory);
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
    };

    return (
        <div className="min-h-screen bg-[#150B2E] text-[#EDE9FE] font-sans pb-20 selection:bg-violet-500 selection:text-white">
            <NavbarSimple />

            <div className="max-w-[1180px] mx-auto px-5 pt-8">
                <header className="text-center mb-8">
                    <div className="font-mono text-xs tracking-[0.28em] text-[#A78BFA] uppercase">
                        BELOVEsPORT · Knock Out Draw
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-1">
                        Rolling <span className="text-[#A78BFA]">Peserta</span>
                    </h1>
                    <div className="text-[#b3aecb] text-sm">
                        Undian otomatis — tim 2 slot dipisah paksa ke bagan Kiri &amp; Kanan
                    </div>
                </header>

                {/* SETUP VIEW */}
                {isSetup ? (
                    <section className="max-w-[420px] mx-auto my-14 bg-white/5 border border-[#A78BFA]/20 rounded-[20px] p-8 text-center backdrop-blur-md">
                        <label className="block text-xs text-[#b3aecb] uppercase tracking-wider mb-2 font-semibold">
                            Total Slot Bagan
                        </label>
                        <input
                            ref={totalInputRef}
                            type="number"
                            min="2"
                            step="2"
                            placeholder="cth. 22"
                            value={totalSlotsInput}
                            onChange={e => setTotalSlotsInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleStartDraw();
                                }
                            }}
                            className="w-full p-3.5 rounded-xl border border-[#A78BFA]/20 bg-black/25 text-[#EDE9FE] font-mono text-2xl text-center font-bold focus:outline-none focus:border-[#A78BFA]"
                        />
                        <div className="text-xs text-[#b3aecb] mt-2.5">
                            Harus genap. Otomatis dibagi rata: Kiri &amp; Kanan.
                        </div>
                        {setupError && (
                            <div className="text-[#ff8a8a] text-xs mt-2 font-medium">{setupError}</div>
                        )}
                        <button
                            onClick={handleStartDraw}
                            className="mt-5 w-full p-3.5 border-none rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#38BDF8] text-[#150B2E] font-extrabold text-sm tracking-wide cursor-pointer hover:brightness-105 transition-all"
                        >
                            Mulai Rolling
                        </button>
                    </section>
                ) : (
                    /* STAGE VIEW */
                    <section className="space-y-6">
                        {/* CONTROL PANEL */}
                        <div className="bg-white/5 border border-[#A78BFA]/20 rounded-[18px] p-5 sm:p-6">
                            <div className="flex flex-wrap gap-3 items-center">
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    placeholder="Ketik nama tim, lalu tekan Spasi / Enter untuk roll…"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === ' ' || e.key === 'Enter') {
                                            e.preventDefault();
                                            handleRoll();
                                        }
                                    }}
                                    disabled={isRolling}
                                    className="flex-1 min-w-[200px] p-3.5 rounded-xl border border-[#A78BFA]/20 bg-black/30 text-[#EDE9FE] text-base font-semibold focus:outline-none focus:border-[#A78BFA] disabled:opacity-50"
                                />

                                <div className="flex border border-[#A78BFA]/20 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setSlotCount(1)}
                                        className={`px-4 py-3.5 font-mono font-bold text-xs cursor-pointer transition-colors ${slotCount === 1 ? 'bg-[#A78BFA] text-[#150B2E]' : 'bg-transparent text-[#b3aecb]'
                                            }`}
                                    >
                                        1 SLOT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSlotCount(2)}
                                        className={`px-4 py-3.5 font-mono font-bold text-xs cursor-pointer transition-colors ${slotCount === 2 ? 'bg-[#A78BFA] text-[#150B2E]' : 'bg-transparent text-[#b3aecb]'
                                            }`}
                                    >
                                        2 SLOT
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRoll}
                                    disabled={isRolling || !teamName.trim()}
                                    className="px-6 py-3.5 border-none rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#38BDF8] text-[#150B2E] font-extrabold text-sm cursor-pointer whitespace-nowrap hover:brightness-105 disabled:opacity-50"
                                >
                                    ROLL
                                </button>
                            </div>

                            <div className="text-[11px] text-[#b3aecb] mt-2.5 font-mono">
                                Tekan <kbd className="bg-white/10 border border-[#A78BFA]/20 rounded px-1.5 py-0.5">Spasi</kbd> atau <kbd className="bg-white/10 border border-[#A78BFA]/20 rounded px-1.5 py-0.5">Enter</kbd> di kolom nama untuk langsung roll.
                            </div>

                            {/* REEL STAGE ANIMATION */}
                            <div className="flex justify-center gap-10 py-5 items-center min-h-[110px]">
                                <div className={`text-center transition-all duration-200 ${reelLeftActive ? 'opacity-100 scale-100' : 'opacity-25 scale-90'}`}>
                                    <div className="font-mono text-[11px] tracking-[0.22em] text-[#38BDF8] uppercase font-bold">Kiri</div>
                                    <div className={`font-mono font-extrabold text-5xl sm:text-6xl text-[#A78BFA] drop-shadow-[0_0_18px_rgba(167,139,250,0.4)] ${settledLeft ? 'animate-bounce' : ''}`}>
                                        {numLeft}
                                    </div>
                                </div>
                                <div className={`text-center transition-all duration-200 ${reelRightActive ? 'opacity-100 scale-100' : 'opacity-25 scale-90'}`}>
                                    <div className="font-mono text-[11px] tracking-[0.22em] text-[#38BDF8] uppercase font-bold">Kanan</div>
                                    <div className={`font-mono font-extrabold text-5xl sm:text-6xl text-[#A78BFA] drop-shadow-[0_0_18px_rgba(167,139,250,0.4)] ${settledRight ? 'animate-bounce' : ''}`}>
                                        {numRight}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center font-mono text-xs tracking-wider text-[#b3aecb] uppercase min-h-[18px]">
                                {statusLine || '\u00A0'}
                            </div>
                        </div>

                        {/* BRACKET SLOTS PROGRESS & GRID */}
                        <div className="bg-white/5 border border-[#A78BFA]/20 rounded-[18px] p-5 sm:p-6">
                            <div className="flex justify-between font-mono text-xs text-[#b3aecb] mb-3.5">
                                <span>Kiri tersisa: <b className="text-[#A78BFA]">{leftAvail.length}</b></span>
                                <span>Total slot: {totalSlots}</span>
                                <span>Kanan tersisa: <b className="text-[#A78BFA]">{rightAvail.length}</b></span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* BAGAN KIRI */}
                                <div>
                                    <div className="font-mono text-xs tracking-[0.24em] text-[#38BDF8] uppercase mb-2.5 font-bold">
                                        Bagan Kiri
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Array.from({ length: halfSize }, (_, i) => i + 1).map(num => {
                                            const data = leftFilled[num];
                                            return (
                                                <div
                                                    key={`left-${num}`}
                                                    className={`relative overflow-hidden rounded-lg p-2.5 min-h-[52px] flex flex-col justify-center gap-0.5 border transition-all ${data ? 'bg-white/10 border-[#A78BFA]/40' : 'bg-black/20 border-[#A78BFA]/20'
                                                        }`}
                                                >
                                                    {data?.color && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: data.color }} />
                                                    )}
                                                    <div className="font-mono text-[10px] text-[#b3aecb]">#{String(num).padStart(2, '0')}</div>
                                                    <div className={`text-xs font-bold leading-tight break-words ${data ? 'text-[#EDE9FE]' : 'text-white/20 font-medium'}`}>
                                                        {data ? `${data.name}${data.slots === 2 ? ' 🔗' : ''}` : '—'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* BAGAN KANAN */}
                                <div>
                                    <div className="font-mono text-xs tracking-[0.24em] text-[#38BDF8] uppercase mb-2.5 font-bold">
                                        Bagan Kanan
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Array.from({ length: halfSize }, (_, i) => i + 1).map(num => {
                                            const data = rightFilled[num];
                                            return (
                                                <div
                                                    key={`right-${num}`}
                                                    className={`relative overflow-hidden rounded-lg p-2.5 min-h-[52px] flex flex-col justify-center gap-0.5 border transition-all ${data ? 'bg-white/10 border-[#A78BFA]/40' : 'bg-black/20 border-[#A78BFA]/20'
                                                        }`}
                                                >
                                                    {data?.color && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: data.color }} />
                                                    )}
                                                    <div className="font-mono text-[10px] text-[#b3aecb]">#{String(num).padStart(2, '0')}</div>
                                                    <div className={`text-xs font-bold leading-tight break-words ${data ? 'text-[#EDE9FE]' : 'text-white/20 font-medium'}`}>
                                                        {data ? `${data.name}${data.slots === 2 ? ' 🔗' : ''}` : '—'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW BAGAN TREE */}
                        <div className="bg-white/5 border border-[#A78BFA]/20 rounded-[18px] p-5 sm:p-6">
                            <div className="flex justify-between items-center mb-3.5">
                                <div className="font-mono text-xs tracking-[0.24em] text-[#38BDF8] uppercase font-bold">
                                    Preview Bagan (Kiri ⇄ Kanan)
                                </div>
                                <label className="flex items-center gap-2 text-xs text-[#b3aecb] cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={showTree}
                                        onChange={e => setShowTree(e.target.checked)}
                                        className="accent-[#A78BFA]"
                                    />
                                    Tampilkan
                                </label>
                            </div>

                            {showTree && (
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                    <div ref={bracketLeftRef} className="rounded-xl bg-black/20 p-4 min-h-[220px] flex items-center justify-center text-xs text-[#b3aecb]">
                                        Bagan Kiri ({Object.keys(leftFilled).length}/{halfSize} Terisi)
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-4 py-2">
                                        <div className="text-center w-full min-w-[130px] border border-dashed border-[#A78BFA]/20 rounded-xl p-3 bg-white/5">
                                            <div className="font-mono text-[10px] tracking-wider text-[#A78BFA] uppercase font-bold mb-1">Final</div>
                                            <div className="text-[11px] text-[#b3aecb] leading-relaxed">Juara Kiri<br />vs<br />Juara Kanan</div>
                                        </div>
                                        <div className="text-center w-full min-w-[130px] border border-[#38BDF8]/30 rounded-xl p-3 bg-[#38BDF8]/5">
                                            <div className="font-mono text-[10px] tracking-wider text-[#38BDF8] uppercase font-bold mb-1">Juara 3</div>
                                            <div className="text-[11px] text-[#b3aecb] leading-relaxed">Kalah SF Kiri<br />vs<br />Kalah SF Kanan</div>
                                        </div>
                                    </div>

                                    <div ref={bracketRightRef} className="rounded-xl bg-black/20 p-4 min-h-[220px] flex items-center justify-center text-xs text-[#b3aecb]">
                                        Bagan Kanan ({Object.keys(rightFilled).length}/{halfSize} Terisi)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIWAYAT UNDIAN */}
                        <div className="bg-white/5 border border-[#A78BFA]/20 rounded-[18px] p-5 sm:p-6">
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
                                                    className="px-2.5 py-1 rounded-lg border border-[#A78BFA]/30 text-[#b3aecb] hover:border-red-400 hover:text-red-400 transition-colors text-[11px]"
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
                                    className="px-4 py-2 rounded-xl border border-[#A78BFA]/30 text-[#b3aecb] text-xs font-semibold hover:border-red-400 hover:text-red-400 transition-colors"
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