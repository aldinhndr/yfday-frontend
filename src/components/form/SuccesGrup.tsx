import { WHATSAPP_GROUPS } from '../../lib/WAGroups'

interface SuccessGrupWAProps {
    lomba: 'badminton' | 'pes' | 'tenis-meja'
    namaTeamOrPeserta: string
}

export default function SuccessGrupWA({ lomba, namaTeamOrPeserta }: SuccessGrupWAProps) {
    const grup = WHATSAPP_GROUPS[lomba]

    return (
        <div className="max-w-md mx-auto text-center py-24 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="font-display text-2xl font-bold mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-cream/70 mb-8 leading-relaxed">
                Terima kasih <span className="text-cream font-semibold">{namaTeamOrPeserta}</span>,
                pendaftaranmu sudah tercatat. Gabung ke grup WhatsApp untuk info jadwal & teknis lomba.
            </p>
            <a
                href={grup.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-night font-semibold
                   hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
                Gabung {grup.nama} →
            </a>

            <p className="text-cream/40 text-xs mt-6">
                Ada kendala? Hubungi panitia di{' '}
                <a href="https://wa.me/6282225700427" className="text-gold underline">0822-2570-0427</a>
            </p>
        </div>
    )
}