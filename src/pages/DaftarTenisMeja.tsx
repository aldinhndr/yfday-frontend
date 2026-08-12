import { useState } from 'react'
import { Link } from 'react-router-dom'
import TextField from '../components/form/TextField.tsx'
import PhoneField from '../components/form/PhoneField.tsx'
import FileUpload from '../components/form/FileUpload.tsx'
import RulesBanner from '../components/form/RulesBanner.tsx'
import { REKENING, GPIN_CHURCHES } from '../constants.ts'
import { WHATSAPP_GROUPS } from '../lib/WAGroups.ts'
import NavbarSimple from '../components/NavbarLogo.tsx'
import RequireLogin from '../components/RequireLogin.tsx'
import { useAuth } from '../context/AuthContext'

const HTM_PER_SLOT = 35000

const RULES_UMUM = [
  'Khusus internal jemaat GPIN (bukan untuk umum).',
  'Pastikan gereja asal yang dipilih sesuai dengan jemaat tempat Anda terdaftar.',
  'Konfirmasi akhir dapat menyusul lewat WhatsApp panitia setelah bukti pembayaran diverifikasi.',
]

interface TenisMejaForm {
  nama: string
  gerejaAsal: string
  noHp: string
  buktiBayar: File | null
}

const emptyForm: TenisMejaForm = {
  nama: '',
  gerejaAsal: '',
  noHp: '',
  buktiBayar: null,
}

type FormErrors = Partial<Record<keyof TenisMejaForm, string>>

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

function validate(form: TenisMejaForm): FormErrors {
  const e: FormErrors = {}
  if (!form.nama.trim()) e.nama = 'Nama peserta wajib diisi'
  if (!form.gerejaAsal) e.gerejaAsal = 'Pilih gereja asal dulu ya'
  if (!form.noHp.trim()) {
    e.noHp = 'Nomor HP/WA wajib diisi'
  } else if (form.noHp.length < 8) {
    e.noHp = 'Nomor HP terlalu pendek'
  }
  if (!form.buktiBayar) {
    e.buktiBayar = 'Unggah bukti pembayaran dulu ya'
  } else if (form.buktiBayar.size > MAX_FILE_SIZE_BYTES) {
    e.buktiBayar = `Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB, file kamu ${(form.buktiBayar.size / 1024 / 1024).toFixed(1)}MB`
  }
  return e
}

export default function DaftarTenisMeja() {
  const { session } = useAuth()
  const [form, setForm] = useState<TenisMejaForm>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (patch: Partial<TenisMejaForm>) => setForm((f) => ({ ...f, ...patch }))

  const submit = async () => {
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitError(null)
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('nama', form.nama)
      body.append('no_hp', `+62${form.noHp}`)
      body.append('gereja_asal', form.gerejaAsal)
      body.append('bukti_bayar', form.buktiBayar as File)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tenis-meja/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.detail || 'Gagal mengirim pendaftaran, coba lagi ya')
      }

      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi ya')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <RequireLogin>
        <NavbarSimple />
        <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center px-6 text-center">
          <span className="w-16 h-16 rounded-full bg-court/20 text-court flex items-center justify-center text-3xl mb-6">✓</span>
          <p className="uppercase tracking-[0.3em] text-xs text-court font-semibold mb-3">Terkirim</p>
          <h1 className="font-display text-3xl font-bold mb-4">Pendaftaran Diterima</h1>
          <p className="text-cream/60 max-w-md mb-8">
            <span className="text-cream">{form.nama}</span> ({form.gerejaAsal}) terdaftar untuk Tenis Meja.
            Panitia akan memverifikasi bukti pembayaran dan bisa menghubungi Anda via WhatsApp di nomor +62{form.noHp}.
          </p>
          <a href={WHATSAPP_GROUPS['tenis-meja'].link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-night font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer mb-4"
          >
            Gabung {WHATSAPP_GROUPS['tenis-meja'].nama} →
          </a>
          <Link to="/" className="px-6 py-3 rounded-full border border-cream/25 hover:border-cream/60 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </RequireLogin>
    )
  }

  return (
    <RequireLogin>
      <NavbarSimple />
      <div className="min-h-screen bg-night text-cream py-16 px-6">
        <div className="max-w-xl mx-auto">
          <Link to="/" className="text-sm text-cream/50 hover:text-cream transition-colors">← Beranda</Link>
          <p className="uppercase tracking-[0.3em] text-xs text-court font-semibold mt-6 mb-2">Pendaftaran • Internal GPIN</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Tenis Meja</h1>

          <div className="bg-night2 border border-cream/10 rounded-2xl p-6 sm:p-8 space-y-5">
            <RulesBanner rules={RULES_UMUM} />

            <TextField label="Nama Peserta" name="nama" required value={form.nama}
              onChange={(e) => set({ nama: e.target.value })} error={errors.nama} />

            <label className="block">
              <span className="text-sm text-cream/70 mb-1.5 block">Gereja Asal <span className="text-gold">*</span></span>
              <select
                value={form.gerejaAsal}
                onChange={(e) => set({ gerejaAsal: e.target.value })}
                className={`w-full rounded-lg bg-night border px-4 py-2.5 text-cream focus:outline-none focus:ring-2 focus:ring-violet/50 transition-colors ${errors.gerejaAsal ? 'border-red-400/70' : 'border-cream/15'
                  }`}
              >
                <option value="" className="bg-night">Pilih gereja asal…</option>
                {GPIN_CHURCHES.map((g) => (
                  <option key={g} value={g} className="bg-night">{g}</option>
                ))}
              </select>
              {errors.gerejaAsal && <span className="text-xs text-red-400 mt-1 block">{errors.gerejaAsal}</span>}
            </label>

            <PhoneField label="Nomor HP/WA" name="noHp" required value={form.noHp}
              onChange={(v) => set({ noHp: v })} error={errors.noHp} />

            <div className="rounded-lg bg-night border border-cream/10 p-5">
              <p className="text-sm text-cream/60 mb-1">Biaya pendaftaran</p>
              <p className="font-display text-2xl font-bold text-gold mb-4">Rp{HTM_PER_SLOT.toLocaleString('id-ID')} / slot</p>
              <p className="text-sm text-cream/60 mb-1">Transfer ke</p>
              <p className="text-cream font-semibold">{REKENING.bank} — {REKENING.nomor}</p>
              <p className="text-cream/60 text-sm">a.n. {REKENING.atasNama}</p>
            </div>

            <FileUpload label="Bukti Pembayaran" required file={form.buktiBayar}
              onChange={(f) => set({ buktiBayar: f })} error={errors.buktiBayar}
              hint="Screenshot atau foto struk transfer" />

            {submitError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2.5">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={submit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-court text-night font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim…' : 'Kirim Pendaftaran'}
            </button>
          </div>
        </div>
      </div>
    </RequireLogin>
  )
}