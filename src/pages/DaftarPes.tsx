import { useState } from 'react'
import { Link } from 'react-router-dom'
import TextField from '../components/form/TextField.tsx'
import FileUpload from '../components/form/FileUpload.tsx'
import RulesBanner from '../components/form/RulesBanner.tsx'
import { REKENING } from '../constants.ts'
import { WHATSAPP_GROUPS } from '../lib/WAGroups.ts'
import NavbarSimple from '../components/NavbarLogo.tsx'
import RequireLogin from '../components/RequireLogin.tsx'
import { useAuth } from '../context/AuthContext'

const HTM_PER_SLOT = 25000
const SLOT_OPTIONS = [1, 2] as const

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_TYPE_LABEL_IMAGE = 'JPG, PNG, atau WEBP'

const RULES_UMUM = [
  'Terbuka untuk semua kalangan / umum, tidak terbatas jemaat GPIN.',
  'Satu orang maksimal mengambil 2 slot pendaftaran.',
  'Peserta datang ke lokasi Lomba.',
]

interface PesForm {
  nama: string
  noHp: string
  asalDaerah: string
  slot: 1 | 2
  buktiBayar: File | null
}

const emptyForm: PesForm = {
  nama: '',
  noHp: '',
  asalDaerah: '',
  slot: 1,
  buktiBayar: null,
}

type FormErrors = Partial<Record<keyof PesForm, string>>

function checkFileSize(file: File | null): string | null {
  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    return `Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB, file kamu ${(file.size / 1024 / 1024).toFixed(1)}MB`
  }
  return null
}

function checkFileType(file: File | null, allowed: string[], label: string): string | null {
  if (file && !allowed.includes(file.type)) {
    return `Format file harus ${label} (format kamu: ${file.type || 'tidak diketahui'})`
  }
  return null
}

function validate(form: PesForm): FormErrors {
  const e: FormErrors = {}
  if (!form.nama.trim()) e.nama = 'Nama peserta wajib diisi'
  if (!form.noHp.trim()) e.noHp = 'Nomor HP/WA wajib diisi'
  if (!form.asalDaerah.trim()) e.asalDaerah = 'Asal daerah wajib diisi'
  if (!form.buktiBayar) {
    e.buktiBayar = 'Unggah bukti pembayaran dulu ya'
  } else {
    const sizeErr = checkFileSize(form.buktiBayar)
    const typeErr = checkFileType(form.buktiBayar, ALLOWED_IMAGE_TYPES, ALLOWED_TYPE_LABEL_IMAGE)
    if (sizeErr) e.buktiBayar = sizeErr
    else if (typeErr) e.buktiBayar = typeErr
  }
  return e
}

export default function DaftarPes() {
  const { session } = useAuth()
  const [form, setForm] = useState<PesForm>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (patch: Partial<PesForm>) => setForm((f) => ({ ...f, ...patch }))
  const total = form.slot * HTM_PER_SLOT

  const submit = async () => {
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitError(null)
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('nama', form.nama)
      body.append('no_hp', form.noHp)
      body.append('asal_daerah', form.asalDaerah)
      body.append('slot', String(form.slot))
      body.append('bukti_bayar', form.buktiBayar as File)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pes/register`, {
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
            <span className="text-cream">{form.nama}</span> terdaftar untuk PES dengan {form.slot} slot.
            Panitia akan memverifikasi bukti pembayaran dalam 1–2 hari kerja.
            Konfirmasi akan dikirim ke nomor {form.noHp}.
          </p>
          <a href={WHATSAPP_GROUPS.pes.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-night font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer mb-4"
          >
            Gabung {WHATSAPP_GROUPS.pes.nama} →
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
          <p className="uppercase tracking-[0.3em] text-xs text-gold font-semibold mt-6 mb-2">Pendaftaran</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">PES</h1>

          <div className="bg-night2 border border-cream/10 rounded-2xl p-6 sm:p-8 space-y-5">
            <RulesBanner rules={RULES_UMUM} />

            <TextField label="Nama Peserta" name="nama" required value={form.nama}
              onChange={(e) => set({ nama: e.target.value })} error={errors.nama} />

            <TextField label="Nomor HP/WA" name="noHp" required value={form.noHp}
              onChange={(e) => set({ noHp: e.target.value })} error={errors.noHp}
              placeholder="08xx-xxxx-xxxx" />

            <TextField label="Asal Kota/Daerah" name="asalDaerah" required value={form.asalDaerah}
              onChange={(e) => set({ asalDaerah: e.target.value })} error={errors.asalDaerah}
              placeholder="Misal: Bandar Lampung" />

            <label className="block">
              <span className="text-sm text-cream/70 mb-1.5 block">Jumlah Slot <span className="text-gold">*</span></span>
              <div className="grid grid-cols-2 gap-2">
                {SLOT_OPTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => set({ slot: s })}
                    className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.slot === s ? 'border-gold bg-gold/15 text-cream' : 'border-cream/15 text-cream/60 hover:border-cream/35'
                      }`}
                  >
                    {s} Slot
                  </button>
                ))}
              </div>
              <span className="text-xs text-cream/40 mt-1 block">Maksimal 2 slot per orang</span>
            </label>

            <div className="rounded-lg bg-night border border-cream/10 p-5">
              <p className="text-sm text-cream/60 mb-1">Total biaya ({form.slot} × Rp{HTM_PER_SLOT.toLocaleString('id-ID')})</p>
              <p className="font-display text-2xl font-bold text-gold mb-4">Rp{total.toLocaleString('id-ID')}</p>
              <p className="text-sm text-cream/60 mb-1">Transfer ke</p>
              <p className="text-cream font-semibold">{REKENING.bank} — {REKENING.nomor}</p>
              <p className="text-cream/60 text-sm">a.n. {REKENING.atasNama}</p>
            </div>

            <FileUpload label="Bukti Pembayaran" required file={form.buktiBayar}
              onChange={(f) => set({ buktiBayar: f })} error={errors.buktiBayar}
              accept="image/jpeg,image/png,image/webp"
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