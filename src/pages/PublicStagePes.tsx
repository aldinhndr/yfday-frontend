// src/pages/PublicStagePes.tsx
import React, { useEffect, useRef, useState } from 'react';
import NavbarSimple from '../components/NavbarLogo';
import { createBracket, buildHalfData, BRACKET_OPTIONS } from '../lib/bracketEngine';

const STORAGE_KEY = 'pes_bracket_live';
const CHANNEL_NAME = 'pes_tournament_sync';
const STAGE_WIDTH = 1600;

type Side = 'left' | 'right';

interface SlotData {
    name: string;
    slots: number;
    color?: string | null;
}

interface RollPosition {
    side: Side;
    num: number;
}

interface SyncPayload {
    type?: string;
    isSetup?: boolean;
    halfSize: number;
    leftFilled?: Record<number, SlotData>;
    rightFilled?: Record<number, SlotData>;
    lastPositions?: RollPosition[];
    opponentCallout?: string;
    showTicker?: boolean;
}

const BRACKET_STYLES = `
  .tree-wrap {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0;
    align-items: stretch;
  }
  .tree-half {
    min-width: 0;
    overflow: hidden;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.18);
  }
  /* Bagan kanan dicerminkan penuh agar arah "Final" mengarah ke kotak tengah */
  .tree-half.right-half {
    transform: scaleX(-1);
  }
  .tree-half.right-half .round-title,
  .tree-half.right-half .player-title,
  .tree-half.right-half .match-status,
  .tree-half.right-half .match-top,
  .tree-half.right-half .match-bottom,
  .tree-half.right-half .side-info-item.current-score,
  .tree-half.right-half .subscore {
    transform: scaleX(-1);
  }
  @keyframes matchPulse {
    0%   { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.7); border-color: #A78BFA; }
    55%  { box-shadow: 0 0 24px 6px rgba(167, 139, 250, 0.4); border-color: #A78BFA; }
    100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
  }
  .match-body.roll-highlight {
    animation: matchPulse 1.7s ease-out;
    border-radius: 8px;
  }
  @keyframes marqueeSlow {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  .animate-marquee-slow {
    display: inline-block;
    white-space: nowrap;
    animation: marqueeSlow 75s linear infinite;
  }
  .animate-marquee-slow:hover {
    animation-play-state: paused;
  }
`;

export default function PublicStagePes() {
    const [syncData, setSyncData] = useState<SyncPayload | null>(null);
    const [callout, setCallout] = useState('');
    const [showTicker, setShowTicker] = useState(false);

    const bracketLeftRef = useRef<HTMLDivElement>(null);
    const bracketRightRef = useRef<HTMLDivElement>(null);
    const bracketLeftInstance = useRef<any>(null);
    const bracketRightInstance = useRef<any>(null);

    // Fungsi Render visual pohon bagan
    const renderVisualTree = (data: SyncPayload) => {
        if (!data || !data.halfSize || data.isSetup) return;
        if (!bracketLeftRef.current || !bracketRightRef.current) return;

        const height = `${Math.max(380, data.halfSize * 48)}px`;
        bracketLeftRef.current.style.height = height;
        bracketRightRef.current.style.height = height;
        bracketLeftRef.current.innerHTML = '';
        bracketRightRef.current.innerHTML = '';

        const leftData = buildHalfData(data.leftFilled ?? {}, data.halfSize);
        const rightData = buildHalfData(data.rightFilled ?? {}, data.halfSize);

        bracketLeftInstance.current = createBracket(leftData, bracketLeftRef.current, BRACKET_OPTIONS);
        bracketRightInstance.current = createBracket(rightData, bracketRightRef.current, BRACKET_OPTIONS);

        // Sorot match yang baru terisi
        if (data.lastPositions && data.lastPositions.length > 0) {
            data.lastPositions.forEach(({ side, num }) => {
                const container = side === 'left' ? bracketLeftRef.current : bracketRightRef.current;
                const matchIndex = Math.floor((num - 1) / 2);
                const matchEl = container?.querySelector(
                    `.round-wrapper[round-index="0"] .match-wrapper[match-order="${matchIndex}"] .match-body`
                );
                if (matchEl) {
                    matchEl.classList.remove('roll-highlight');
                    void (matchEl as HTMLElement).offsetWidth;
                    matchEl.classList.add('roll-highlight');
                }
            });
        }
    };

    // 1. Lifecycle Listener BroadcastChannel & LocalStorage
    useEffect(() => {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            try {
                const parsed: SyncPayload = JSON.parse(cached);
                setSyncData(parsed);
                if (parsed.opponentCallout) setCallout(parsed.opponentCallout);
                if (typeof parsed.showTicker === 'boolean') setShowTicker(parsed.showTicker);
            } catch (e) {
                console.error('Error parsing cached data:', e);
            }
        }

        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event: MessageEvent<SyncPayload>) => {
            if (event.data?.type !== 'SYNC_STATE') return;
            setSyncData(event.data);
            if (event.data.opponentCallout !== undefined) setCallout(event.data.opponentCallout);
            if (typeof event.data.showTicker === 'boolean') setShowTicker(event.data.showTicker);
        };

        return () => {
            channel.close();
            bracketLeftInstance.current?.uninstall?.();
            bracketRightInstance.current?.uninstall?.();
        };
    }, []);

    // 2. Render ulang bagan setiap kali data turnamen (syncData) berubah
    useEffect(() => {
        if (syncData) {
            renderVisualTree(syncData);
        }
    }, [syncData?.leftFilled, syncData?.rightFilled, syncData?.halfSize, syncData?.isSetup]);

    return (
        <div className="min-h-screen w-full overflow-auto bg-[#0a0716] flex justify-center pb-16">
            <div
                className="bg-[#150B2E] text-[#EDE9FE] flex flex-col select-none shrink-0"
                style={{ width: STAGE_WIDTH }}
            >
                <style>{BRACKET_STYLES}</style>

                <NavbarSimple />

                <div className="flex-1 flex flex-col justify-start px-6 pt-24 pb-4">
                    {/* HEADER STAGE */}
                    <header className="text-center mb-3">
                        <div className="font-mono text-[10px] tracking-[0.3em] text-[#A78BFA] uppercase">
                            YouthFunDay · LIVE BRACKET DRAW
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mt-0.5">
                            Bagan Turnamen <span className="text-[#A78BFA]">PES 2026</span>
                        </h1>
                        <div className="font-mono text-xs text-[#38BDF8] mt-1 min-h-[18px]">
                            {callout || (syncData?.isSetup ? 'Menunggu inisialisasi turnamen oleh admin…' : 'Menunggu pengundian peserta dari ruang kontrol…')}
                        </div>
                    </header>

                    {/* VISUAL BRACKET TREE */}
                    <div className="bg-white/5 border border-[#A78BFA]/20 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
                        {syncData?.isSetup ? (
                            <div className="h-[420px] flex items-center justify-center flex-col text-center">
                                <div className="text-4xl mb-3">🎮</div>
                                <h3 className="text-lg font-bold text-white">Turnamen Belum Dimulai</h3>
                                <p className="text-xs text-cream/50 mt-1">Admin sedang menyiapkan slot turnamen di ruang kontrol.</p>
                            </div>
                        ) : (
                            <div className="tree-wrap" id="treeWrap">
                                {/* BAGAN KIRI */}
                                <div className="tree-half" ref={bracketLeftRef} />

                                {/* FINAL & JUARA 3 (TENGAH) */}
                                <div className="w-[140px] flex flex-col items-center justify-center gap-4 px-2">
                                    <div className="w-full text-center border border-dashed border-[#A78BFA]/40 rounded-xl p-3 bg-white/5 shadow-[0_0_20px_rgba(167,139,250,0.15)]">
                                        <div className="font-mono text-[10px] tracking-wider text-[#A78BFA] uppercase font-bold mb-1">
                                            Grand Final
                                        </div>
                                        <div className="text-[11px] text-[#b3aecb] leading-tight">
                                            Juara Kiri<br />vs<br />Juara Kanan
                                        </div>
                                    </div>

                                    <div className="w-full text-center border border-[#38BDF8]/40 rounded-xl p-2.5 bg-[#38BDF8]/5">
                                        <div className="font-mono text-[10px] tracking-wider text-[#38BDF8] uppercase font-bold mb-1">
                                            Juara 3
                                        </div>
                                        <div className="text-[10px] text-[#b3aecb] leading-tight">
                                            Kalah SF Kiri<br />vs<br />Kalah SF Kanan
                                        </div>
                                    </div>
                                </div>

                                {/* BAGAN KANAN (DICERMINKAN) */}
                                <div className="tree-half right-half" ref={bracketRightRef} />
                            </div>
                        )}
                    </div>

                    <footer className="text-center font-mono text-[10px] text-[#b3aecb]/40 mt-3">
                        YOUTH FUN DAY 2026 · REAL-TIME STAGE SYNC
                    </footer>
                </div>

                {/* RUNNING TICKER ALERT DI UJUNG BAWAH LAYAR */}
                {showTicker && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t-2 border-gold py-2.5 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.9)] backdrop-blur-md overflow-hidden flex items-center">
                        <div className="shrink-0 bg-gold text-[#150B2E] px-3 py-0.5 rounded font-extrabold text-[11px] uppercase tracking-wider mr-4 shadow-md">
                            PENGUMUMAN RESMI
                        </div>
                        <div className="overflow-hidden w-full whitespace-nowrap">
                            <div className="animate-marquee-slow font-mono text-[13px] text-cream font-medium tracking-wide">
                                📌 <span className="text-gold font-bold">RULES & REGULASI TURNAMEN PES:</span> Sistem Knockout (Gugur) • Durasi 10 Menit Regular Time • Extra Time & Penalti jika skor imbang • Dilarang Pause saat bola aktif (Hanya boleh saat bola out/foul) • Keputusan Panitia & Wasit Mutlak. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🏸 <span className="text-[#38BDF8] font-bold">PENDAFTARAN BADMINTON:</span> Masih Dibuka untuk kategori Ganda Putra & Ganda Campuran sampai tanggal 25 Agustus 2026. Segera daftarkan tim Anda sekarang di meja registrasi atau website resmi!
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}