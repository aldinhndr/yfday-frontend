// src/components/form/GpinQuiz.tsx
import { useState } from 'react'
import { GPIN_CHURCHES, GPIN_PASTOR_ANSWERS, type GpinChurchName } from '../../constants'
import TextField from './TextField'

interface GpinQuizProps {
    selectedChurch: string
    isVerified: boolean
    onSelectChurch: (churchName: string) => void
    onVerified: (churchName: string) => void
}

export default function GpinQuiz({
    selectedChurch,
    isVerified,
    onSelectChurch,
    onVerified,
}: GpinQuizProps) {
    const [answerInput, setAnswerInput] = useState('')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleVerify = () => {
        if (!selectedChurch) {
            setErrorMsg('Pilih cabang GPIN kamu terlebih dahulu.')
            return
        }

        const validAnswers = GPIN_PASTOR_ANSWERS[selectedChurch as GpinChurchName] || []
        const cleanAnswer = answerInput.trim().toLowerCase()

        if (!cleanAnswer) {
            setErrorMsg('Nama Hamba Tuhan / Gembala tidak boleh kosong.')
            return
        }

        const isMatch = validAnswers.some(
            (ans) => cleanAnswer.includes(ans.toLowerCase()) || ans.toLowerCase().includes(cleanAnswer)
        )

        if (isMatch) {
            setErrorMsg(null)
            onVerified(selectedChurch)
        } else {
            setErrorMsg('Nama Hamba Tuhan belum tepat. Pastikan ejaan benar.')
        }
    }

    return (
        <div className="bg-night p-5 rounded-xl border border-cream/15 space-y-4">
            <div className="flex items-center justify-between border-b border-cream/10 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <span>🛡️</span> Verifikasi Anggota GPIN
                </h3>
                {isVerified && (
                    <span className="text-[10px] bg-court/20 text-court font-bold px-2 py-0.5 rounded-full border border-court/30">
                        Terverifikasi
                    </span>
                )}
            </div>

            <label className="block">
                <span className="text-xs text-cream/70 mb-1 block">
                    Pilih Asal Cabang GPIN <span className="text-gold">*</span>
                </span>
                <select
                    value={selectedChurch}
                    onChange={(e) => {
                        onSelectChurch(e.target.value)
                        setErrorMsg(null)
                    }}
                    disabled={isVerified}
                    className="w-full bg-night2 border border-cream/20 text-cream text-xs rounded-lg px-3 py-2.5 outline-none focus:border-gold disabled:opacity-60"
                >
                    <option value="">-- Pilih Cabang GPIN --</option>
                    {GPIN_CHURCHES.map((church) => (
                        <option key={church} value={church}>
                            {church}
                        </option>
                    ))}
                </select>
            </label>

            {selectedChurch && !isVerified && (
                <div className="space-y-3 pt-1">
                    <TextField
                        label={`Siapa Nama Hamba Tuhan / Gembala di ${selectedChurch}?`}
                        name="gpinPastor"
                        required
                        value={answerInput}
                        onChange={(e) => {
                            setAnswerInput(e.target.value)
                            setErrorMsg(null)
                        }}
                        placeholder="Contoh: Pdt. Nama Gembala"
                    />

                    <button
                        type="button"
                        onClick={handleVerify}
                        className="w-full py-2.5 rounded-lg bg-gold text-night text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md"
                    >
                        Verifikasi Jawaban
                    </button>
                </div>
            )}

            {isVerified && (
                <div className="p-3 rounded-lg bg-court/10 border border-court/30 text-court text-xs font-medium flex items-center gap-2">
                    <span>✓</span> Verifikasi Berhasil ({selectedChurch}). Kamu bisa lanjut mengisi nama tim & peserta.
                </div>
            )}

            {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    ⚠️ {errorMsg}
                </div>
            )}
        </div>
    )
}