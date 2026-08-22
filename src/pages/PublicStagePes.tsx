import React, { useEffect, useState, useRef } from 'react';
import { BracketData } from '../lib/brackeEngine';

export default function PublicStagePes() {
    const [syncData, setSyncData] = useState<any>(null);
    const [callout, setCallout] = useState('');
    const leftHalfRef = useRef<HTMLDivElement>(null);
    const rightHalfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Muat Cache Awal
        const cached = localStorage.getItem('pes_bracket_live');
        if (cached) setSyncData(JSON.parse(cached));

        // 2. Pasang Listener Broadcast
        const channel = new BroadcastChannel('pes_tournament_sync');
        channel.onmessage = (event) => {
            if (event.data?.type === 'SYNC_STATE') {
                setSyncData(event.data);
                if (event.data.opponentCallout) setCallout(event.data.opponentCallout);
            }
        };

        return () => channel.close();
    }, []);

    const halfSize = syncData?.halfSize || 0;
    const leftFilled = syncData?.leftFilled || {};
    const rightFilled = syncData?.rightFilled || {};

    return (
        <div className="min-h-screen bg-[#150B2E] text-[#EDE9FE] p-6 flex flex-col justify-between select-none">
            <header className="text-center mb-4">
                <div className="font-mono text-xs tracking-[0.3em] text-[#A78BFA] uppercase">LIVE STAGE · BRACKET DISPLAY</div>
                <h1 className="text-3xl font-extrabold text-white">YOUTH FUN DAY — PES BRACKET</h1>
                <div className="font-mono text-sm text-[#38BDF8] mt-1">{callout || 'Menunggu undian peserta…'}</div>
            </header>

            {/* DUAL BRACKET GRID DISPLAY */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center my-auto">
                {/* SISI KIRI */}
                <div className="bg-black/30 border border-[#A78BFA]/20 rounded-2xl p-5 min-h-[400px]">
                    <div className="font-mono text-xs text-[#38BDF8] uppercase tracking-widest mb-3 font-bold">BAGAN KIRI (1 - {halfSize})</div>
                    <div className="grid grid-cols-2 gap-2.5">
                        {Array.from({ length: halfSize }, (_, i) => i + 1).map(num => {
                            const data = leftFilled[num];
                            return (
                                <div key={`l-${num}`} className={`p-3 rounded-xl border flex flex-col justify-center ${data ? 'bg-white/10 border-[#A78BFA]/60 shadow-[0_0_15px_rgba(167,139,250,0.15)]' : 'bg-black/20 border-white/5'}`}>
                                    <span className="font-mono text-[10px] text-[#b3aecb]">SLOT #{String(num).padStart(2, '0')}</span>
                                    <span className="font-bold text-sm text-white truncate">{data ? data.name : '—'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TENGAH (FINAL) */}
                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="text-center w-36 border border-dashed border-[#A78BFA]/40 rounded-2xl p-4 bg-white/5 shadow-[0_0_20px_rgba(167,139,250,0.2)]">
                        <div className="font-mono text-[11px] text-[#A78BFA] uppercase font-bold mb-1">GRAND FINAL</div>
                        <div className="text-xs text-[#b3aecb]">Juara Kiri<br />vs<br />Juara Kanan</div>
                    </div>
                    <div className="text-center w-36 border border-[#38BDF8]/40 rounded-2xl p-3 bg-[#38BDF8]/5">
                        <div className="font-mono text-[10px] text-[#38BDF8] uppercase font-bold mb-1">JUARA 3</div>
                        <div className="text-xs text-[#b3aecb]">Runner-up SF</div>
                    </div>
                </div>

                {/* SISI KANAN */}
                <div className="bg-black/30 border border-[#A78BFA]/20 rounded-2xl p-5 min-h-[400px]">
                    <div className="font-mono text-xs text-[#38BDF8] uppercase tracking-widest mb-3 font-bold">BAGAN KANAN (1 - {halfSize})</div>
                    <div className="grid grid-cols-2 gap-2.5">
                        {Array.from({ length: halfSize }, (_, i) => i + 1).map(num => {
                            const data = rightFilled[num];
                            return (
                                <div key={`r-${num}`} className={`p-3 rounded-xl border flex flex-col justify-center ${data ? 'bg-white/10 border-[#A78BFA]/60 shadow-[0_0_15px_rgba(167,139,250,0.15)]' : 'bg-black/20 border-white/5'}`}>
                                    <span className="font-mono text-[10px] text-[#b3aecb]">SLOT #{String(num).padStart(2, '0')}</span>
                                    <span className="font-bold text-sm text-white truncate">{data ? data.name : '—'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer className="text-center font-mono text-[11px] text-[#b3aecb]/60">
                YOUTHFUNDAY LIVE TOURNAMENT SEEDING SYSTEM
            </footer>
        </div>
    );
}