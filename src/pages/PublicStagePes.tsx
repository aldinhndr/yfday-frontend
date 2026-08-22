// src/pages/PublicStagePes.tsx
import React, { useEffect, useRef, useState } from 'react';
import NavbarSimple from '../components/NavbarLogo';
import { createBracket, buildHalfData, BRACKET_OPTIONS } from '../lib/bracketEngine';

const STORAGE_KEY = 'pes_bracket_live';
const CHANNEL_NAME = 'pes_tournament_sync';

// Lebar panggung tetap (desktop-only). Tidak ada breakpoint responsif —
// di layar/window berapa pun ukurannya, tampilan ini tidak berubah susunan,
// hanya di-scroll kalau viewport lebih sempit dari lebar ini.
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
    halfSize: number;
    leftFilled?: Record<number, SlotData>;
    rightFilled?: Record<number, SlotData>;
    lastPositions?: RollPosition[];
    opponentCallout?: string;
}

// CSS dipisah jadi konstanta di luar komponen supaya tidak dibuat ulang tiap render.
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
  /* Bagan kanan dicerminkan penuh agar arah "Final"-nya mengarah ke kotak juara di tengah,
     lalu teks di dalamnya di-flip balik satu kali lagi supaya tetap terbaca normal. */
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
`;

export default function PublicStagePes() {
    const [callout, setCallout] = useState('');

    const bracketLeftRef = useRef<HTMLDivElement>(null);
    const bracketRightRef = useRef<HTMLDivElement>(null);
    const bracketLeftInstance = useRef<any>(null);
    const bracketRightInstance = useRef<any>(null);

    // Menyorot (pulse) match yang baru saja terisi hasil roll.
    const highlightRolledMatches = (positions?: RollPosition[]) => {
        if (!positions?.length) return;

        positions.forEach(({ side, num }) => {
            const container = side === 'left' ? bracketLeftRef.current : bracketRightRef.current;
            const matchIndex = Math.floor((num - 1) / 2);
            const matchEl = container?.querySelector(
                `.round-wrapper[round-index="0"] .match-wrapper[match-order="${matchIndex}"] .match-body`
            );
            if (!matchEl) return;

            matchEl.classList.remove('roll-highlight');
            void (matchEl as HTMLElement).offsetWidth; // restart animasi walau match yang sama
            matchEl.classList.add('roll-highlight');
        });
    };

    const drawBracketTree = (data: SyncPayload) => {
        if (!data?.halfSize || !bracketLeftRef.current || !bracketRightRef.current) return;

        const height = `${Math.max(380, data.halfSize * 50)}px`;
        bracketLeftRef.current.style.height = height;
        bracketRightRef.current.style.height = height;
        bracketLeftRef.current.innerHTML = '';
        bracketRightRef.current.innerHTML = '';

        const leftData = buildHalfData(data.leftFilled ?? {}, data.halfSize);
        const rightData = buildHalfData(data.rightFilled ?? {}, data.halfSize);

        bracketLeftInstance.current = createBracket(leftData, bracketLeftRef.current, BRACKET_OPTIONS);
        bracketRightInstance.current = createBracket(rightData, bracketRightRef.current, BRACKET_OPTIONS);

        highlightRolledMatches(data.lastPositions);
    };

    useEffect(() => {
        // 1. Muat state terakhir dari localStorage begitu halaman dibuka
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            const parsed: SyncPayload = JSON.parse(cached);
            if (parsed.opponentCallout) setCallout(parsed.opponentCallout);
            // beri jeda 1 tick supaya ref div sudah ter-mount sebelum digambar
            setTimeout(() => drawBracketTree(parsed), 100);
        }

        // 2. Dengarkan update real-time dari ruang kontrol (panel admin) via BroadcastChannel
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event: MessageEvent<SyncPayload>) => {
            if (event.data?.type !== 'SYNC_STATE') return;
            if (event.data.opponentCallout) setCallout(event.data.opponentCallout);
            drawBracketTree(event.data);
        };

        return () => {
            channel.close();
            bracketLeftInstance.current?.uninstall?.();
            bracketRightInstance.current?.uninstall?.();
        };
    }, []);

    return (
        // Wrapper luar hanya untuk menengahkan panggung & menampung scroll kalau
        // window lebih kecil dari STAGE_WIDTH — bukan untuk bikin layout responsif.
        <div className="min-h-screen w-full overflow-auto bg-[#0a0716] flex justify-center">
            <div
                className="bg-[#150B2E] text-[#EDE9FE] flex flex-col select-none shrink-0"
                style={{ width: STAGE_WIDTH }}
            >
                <style>{BRACKET_STYLES}</style>

                <NavbarSimple />

                <div className="flex-1 flex flex-col justify-between p-6">
                    {/* HEADER STAGE */}
                    <header className="text-center mb-6">
                        <div className="font-mono text-xs tracking-[0.3em] text-[#A78BFA] uppercase">
                            BELOVEsPORT · KNOCK OUT DRAW
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mt-1">
                            Bagan Turnamen <span className="text-[#A78BFA]">PES 2026</span>
                        </h1>
                        <div className="font-mono text-sm text-[#38BDF8] mt-2 min-h-[24px]">
                            {callout || 'Menunggu pengundian peserta dari ruang kontrol…'}
                        </div>
                    </header>

                    {/* VISUAL BRACKET TREE */}
                    <div className="bg-white/5 border border-[#A78BFA]/20 rounded-2xl p-6 my-auto shadow-2xl backdrop-blur-md">
                        <div className="tree-wrap" id="treeWrap">
                            {/* BAGAN KIRI */}
                            <div className="tree-half" ref={bracketLeftRef} />

                            {/* FINAL & JUARA 3 (TENGAH) */}
                            <div className="w-[140px] flex flex-col items-center justify-center gap-6 px-2">
                                <div className="w-full text-center border border-dashed border-[#A78BFA]/40 rounded-xl p-3.5 bg-white/5 shadow-[0_0_20px_rgba(167,139,250,0.15)]">
                                    <div className="font-mono text-[10px] tracking-wider text-[#A78BFA] uppercase font-bold mb-1">
                                        Grand Final
                                    </div>
                                    <div className="text-xs text-[#b3aecb] leading-tight">
                                        Juara Kiri<br />vs<br />Juara Kanan
                                    </div>
                                </div>

                                <div className="w-full text-center border border-[#38BDF8]/40 rounded-xl p-3 bg-[#38BDF8]/5">
                                    <div className="font-mono text-[10px] tracking-wider text-[#38BDF8] uppercase font-bold mb-1">
                                        Juara 3
                                    </div>
                                    <div className="text-[11px] text-[#b3aecb] leading-tight">
                                        Kalah SF Kiri<br />vs<br />Kalah SF Kanan
                                    </div>
                                </div>
                            </div>

                            {/* BAGAN KANAN (DICERMINKAN) */}
                            <div className="tree-half right-half" ref={bracketRightRef} />
                        </div>
                    </div>

                    <footer className="text-center font-mono text-[11px] text-[#b3aecb]/50 mt-4">
                        YOUTH FUN DAY 2026 · LIVE SYNCHRONIZED BRACKET SEEDING
                    </footer>
                </div>
            </div>
        </div>
    );
}