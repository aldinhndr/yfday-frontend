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
    halfSize: number;
    leftFilled?: Record<number, SlotData>;
    rightFilled?: Record<number, SlotData>;
    lastPositions?: RollPosition[];
    opponentCallout?: string;
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
            void (matchEl as HTMLElement).offsetWidth;
            matchEl.classList.add('roll-highlight');
        });
    };

    const drawBracketTree = (data: SyncPayload) => {
        if (!data?.halfSize || !bracketLeftRef.current || !bracketRightRef.current) return;

        const height = `${Math.max(380, data.halfSize * 48)}px`;
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
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            const parsed: SyncPayload = JSON.parse(cached);
            if (parsed.opponentCallout) setCallout(parsed.opponentCallout);
            setTimeout(() => drawBracketTree(parsed), 100);
        }

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
        <div className="min-h-screen w-full overflow-auto bg-[#0a0716] flex justify-center">
            <div
                className="bg-[#150B2E] text-[#EDE9FE] flex flex-col select-none shrink-0"
                style={{ width: STAGE_WIDTH }}
            >
                <style>{BRACKET_STYLES}</style>

                <NavbarSimple />

                {/* Kontainer utama rapat dan pas di bawah navbar */}
                <div className="flex-1 flex flex-col justify-start px-6 pt-24 pb-4">
                    {/* HEADER STAGE RAPAT */}
                    <header className="text-center mb-3">
                        <div className="font-mono text-[10px] tracking-[0.3em] text-[#A78BFA] uppercase">
                            YouthFunDay · LIVE BRACKET DRAW
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mt-0.5">
                            Bagan Turnamen <span className="text-[#A78BFA]">PES 2026</span>
                        </h1>
                        <div className="font-mono text-xs text-[#38BDF8] mt-1 min-h-[18px]">
                            {callout || 'Menunggu pengundian peserta dari ruang kontrol…'}
                        </div>
                    </header>

                    {/* VISUAL BRACKET TREE LANGSUNG MENEMPEL */}
                    <div className="bg-white/5 border border-[#A78BFA]/20 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
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
                    </div>

                    <footer className="text-center font-mono text-[10px] text-[#b3aecb]/40 mt-3">
                        YOUTH FUN DAY 2026 · REAL-TIME STAGE SYNC
                    </footer>
                </div>
            </div>
        </div>
    );
}