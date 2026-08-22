// src/pages/PublicStagePes.tsx
import React, { useEffect, useState, useRef } from 'react';
import { createBracket, buildHalfData, BRACKET_OPTIONS } from '../lib/bracketEngine';

export default function PublicStagePes() {
    const [syncData, setSyncData] = useState<any>(null);
    const [callout, setCallout] = useState('');

    const bracketLeftRef = useRef<HTMLDivElement>(null);
    const bracketRightRef = useRef<HTMLDivElement>(null);
    const bracketLeftInstance = useRef<any>(null);
    const bracketRightInstance = useRef<any>(null);

    const drawBracketTree = (data: any) => {
        if (!data || !data.halfSize) return;

        const height = Math.max(380, data.halfSize * 50) + 'px';

        if (bracketLeftRef.current && bracketRightRef.current) {
            bracketLeftRef.current.style.height = height;
            bracketRightRef.current.style.height = height;
            bracketLeftRef.current.innerHTML = '';
            bracketRightRef.current.innerHTML = '';

            const leftData = buildHalfData(data.leftFilled || {}, data.halfSize);
            const rightData = buildHalfData(data.rightFilled || {}, data.halfSize);

            bracketLeftInstance.current = createBracket(leftData, bracketLeftRef.current, BRACKET_OPTIONS);
            bracketRightInstance.current = createBracket(rightData, bracketRightRef.current, BRACKET_OPTIONS);

            // Efek Sorotan Pulse pada Match yang baru di-roll
            if (data.lastPositions && Array.isArray(data.lastPositions)) {
                data.lastPositions.forEach((p: { side: 'left' | 'right'; num: number }) => {
                    const container = p.side === 'left' ? bracketLeftRef.current : bracketRightRef.current;
                    const matchIdx = Math.floor((p.num - 1) / 2);
                    const matchEl = container?.querySelector(
                        `.round-wrapper[round-index="0"] .match-wrapper[match-order="${matchIdx}"] .match-body`
                    );
                    if (matchEl) {
                        matchEl.classList.remove('roll-highlight');
                        void (matchEl as HTMLElement).offsetWidth;
                        matchEl.classList.add('roll-highlight');
                    }
                });
            }
        }
    };

    useEffect(() => {
        // 1. Muat data awal dari LocalStorage
        const cached = localStorage.getItem('pes_bracket_live');
        if (cached) {
            const parsed = JSON.parse(cached);
            setSyncData(parsed);
            if (parsed.opponentCallout) setCallout(parsed.opponentCallout);
            setTimeout(() => drawBracketTree(parsed), 100);
        }

        // 2. Pasang Listener Real-Time BroadcastChannel
        const channel = new BroadcastChannel('pes_tournament_sync');
        channel.onmessage = (event) => {
            if (event.data?.type === 'SYNC_STATE') {
                setSyncData(event.data);
                if (event.data.opponentCallout) setCallout(event.data.opponentCallout);
                drawBracketTree(event.data);
            }
        };

        return () => {
            channel.close();
            if (bracketLeftInstance.current?.uninstall) bracketLeftInstance.current.uninstall();
            if (bracketRightInstance.current?.uninstall) bracketRightInstance.current.uninstall();
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#150B2E] text-[#EDE9FE] p-6 flex flex-col justify-between select-none">
            <style>{`
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
          background: rgba(0,0,0,0.18);
        }
        /* Bagan kanan dicerminkan penuh agar final mengarah ke kotak juara tengah */
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
          0% { box-shadow: 0 0 0 0 rgba(167,139,250,0.7); border-color: #A78BFA; }
          55% { box-shadow: 0 0 24px 6px rgba(167,139,250,0.4); border-color: #A78BFA; }
          100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); }
        }
        .match-body.roll-highlight {
          animation: matchPulse 1.7s ease-out;
          border-radius: 8px;
        }
        @media(max-width: 820px) {
          .tree-wrap { grid-template-columns: 1fr; }
        }
      `}</style>

            {/* HEADER STAGE */}
            <header className="text-center mb-6">
                <div className="font-mono text-xs tracking-[0.3em] text-[#A78BFA] uppercase">
                    BELOVEsPORT · KNOCK OUT DRAW
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
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
                    <div className="tree-half" ref={bracketLeftRef}></div>

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
                    <div className="tree-half right-half" ref={bracketRightRef}></div>
                </div>
            </div>

            <footer className="text-center font-mono text-[11px] text-[#b3aecb]/50 mt-4">
                YOUTH FUN DAY 2026 · LIVE SYNCHRONIZED BRACKET SEEDING
            </footer>
        </div>
    );
}