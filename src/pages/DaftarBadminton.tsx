import { useState } from 'react'
import { Link } from 'react-router-dom'
import TextField from '../components/form/TextField.tsx'
import PhoneField from '../components/form/PhoneField.tsx'
import FileUpload from '../components/form/FileUpload.tsx'
import FormStepper from '../components/form/FormStepper.tsx'
import RulesBanner from '../components/form/RulesBanner.tsx'
import RequireLogin from '../components/RequireLogin.tsx'
import { useAuth } from '../context/AuthContext'

import { REKENING } from '../constants.ts'
import { WHATSAPP_GROUPS } from '../lib/WAGroups.ts'
import NavbarSimple from '../components/NavbarLogo.tsx'

const KATEGORI = ['Ganda Putra', 'Ganda Putri', 'Ganda Campuran'] as const
type Kategori = (typeof KATEGORI)[number] | ''

const KATEGORI_TO_API: Record<(typeof KATEGORI)[number], string> = {
  'Ganda Putra': 'ganda_putra',
  'Ganda Putri': 'ganda_putri',
  'Ganda Campuran': 'campuran',
}

const HTM = 75000
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ALLOWED_TYPE_LABEL_IMAGE = 'JPG, PNG, atau WEBP'
const ALLOWED_TYPE_LABEL_DOC = 'JPG, PNG, WEBP, atau PDF'

// Contoh/template surat pengantar gereja yang bisa diunduh peserta sebelum mengisi
const CONTOH_SURAT_URL = '/templates/contoh-surat-pengantar-gereja.docx'

const RULES_UMUM = [
  'Minimal salah satu peserta (Peserta 1) harus berasal dari gereja yang mengeluarkan Surat Pengantar tim ini.',
  'Partner (Peserta 2) boleh berasal dari luar gereja tersebut, dengan syarat namanya turut dicantumkan di Surat Pengantar.',
  'Jika gereja tidak berkenan mencantumkan nama partner yang bukan jemaatnya di Surat Pengantar, partner wajib melampirkan foto identitas diri (KTP/KTM/SIM/dll) sebagai gantinya.',
]

interface BadmintonForm {
  kategori: Kategori
  namaTim: string
  gerejaAsal: string
  suratGereja: File | null
  peserta1Nama: string
  peserta1Foto: File | null
  peserta2Nama: string
  peserta2Foto: File | null
  peserta2LuarGereja: boolean
  peserta2Identitas: File | null
  noHp: string
  asalKota: string
  buktiBayar: File | null
}

const emptyForm: BadmintonForm = {
  kategori: '',
  namaTim: '',
  gerejaAsal: '',
  suratGereja: null,
  peserta1Nama: '',
  peserta1Foto: null,
  peserta2Nama: '',
  peserta2Foto: null,
  peserta2LuarGereja: false,
  peserta2Identitas: null,
  noHp: '',
  asalKota: '',
  buktiBayar: null,
}

type FormErrors = Partial<Record<keyof BadmintonForm, string>>

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

function validateStep(step: number, form: BadmintonForm): FormErrors {
  const e: FormErrors = {}
  if (step === 0) {
    if (!form.kategori) e.kategori = 'Pilih kategori dulu ya'
    if (!form.namaTim.trim()) e.namaTim = 'Nama tim wajib diisi'
    if (!form.gerejaAsal.trim()) e.gerejaAsal = 'Gereja asal wajib diisi'
    if (!form.suratGereja) e.suratGereja = 'Surat pengantar gereja wajib diunggah'
    else {
      const sizeErr = checkFileSize(form.suratGereja)
      const typeErr = checkFileType(form.suratGereja, ALLOWED_DOC_TYPES, ALLOWED_TYPE_LABEL_DOC)
      if (sizeErr) e.suratGereja = sizeErr
      else if (typeErr) e.suratGereja = typeErr
    }
  }
  if (step === 1) {
    if (!form.peserta1Nama.trim()) e.peserta1Nama = 'Nama peserta 1 wajib diisi'
    if (!form.peserta1Foto) {
      e.peserta1Foto = 'Foto peserta 1 wajib diunggah'
    } else {
      const foto1Err = checkFileSize(form.peserta1Foto)
      const foto1TypeErr = checkFileType(form.peserta1Foto, ALLOWED_IMAGE_TYPES, ALLOWED_TYPE_LABEL_IMAGE)
      if (foto1Err) e.peserta1Foto = foto1Err
      else if (foto1TypeErr) e.peserta1Foto = foto1TypeErr
    }
    if (!form.peserta2Nama.trim()) e.peserta2Nama = 'Nama peserta 2 wajib diisi'
    if (!form.peserta2Foto) {
      e.peserta2Foto = 'Foto peserta 2 wajib diunggah'
    } else {
      const foto2Err = checkFileSize(form.peserta2Foto)
      const foto2TypeErr = checkFileType(form.peserta2Foto, ALLOWED_IMAGE_TYPES, ALLOWED_TYPE_LABEL_IMAGE)
      if (foto2Err) e.peserta2Foto = foto2Err
      else if (foto2TypeErr) e.peserta2Foto = foto2TypeErr
    }
    if (form.peserta2LuarGereja && !form.peserta2Identitas) {
      e.peserta2Identitas = 'Foto identitas (KTP/KTM/SIM) wajib diunggah karena partner dari luar gereja'
    } else {
      const idErr = checkFileSize(form.peserta2Identitas)
      const idTypeErr = checkFileType(form.peserta2Identitas, ALLOWED_DOC_TYPES, ALLOWED_TYPE_LABEL_DOC)
      if (idErr) e.peserta2Identitas = idErr
      else if (idTypeErr) e.peserta2Identitas = idTypeErr
    }
    if (!form.noHp.trim()) {
      e.noHp = 'Nomor HP/WA wajib diisi'
    } else if (form.noHp.length < 8) {
      e.noHp = 'Nomor HP terlalu pendek'
    }
    if (!form.asalKota.trim()) e.asalKota = 'Asal kota/daerah wajib diisi'
  }
  if (step === 2) {
    if (!form.buktiBayar) {
      e.buktiBayar = 'Unggah bukti pembayaran dulu ya'
    } else {
      const sizeErr = checkFileSize(form.buktiBayar)
      const typeErr = checkFileType(form.buktiBayar, ALLOWED_IMAGE_TYPES, ALLOWED_TYPE_LABEL_IMAGE)
      if (sizeErr) e.buktiBayar = sizeErr
      else if (typeErr) e.buktiBayar = typeErr
    }
  }
  return e
}

export default function DaftarBadminton() {
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<BadmintonForm>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (patch: Partial<BadmintonForm>) => setForm((f) => ({ ...f, ...patch }))

  const next = () => {
    const e = validateStep(step, form)
    setErrors(e)
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, 2))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    const e = validateStep(2, form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitError(null)
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('kategori', KATEGORI_TO_API[form.kategori as (typeof KATEGORI)[number]])
      body.append('nama_team', form.namaTim)
      body.append('gereja_asal', form.gerejaAsal)
      body.append('nama_peserta_1', form.peserta1Nama)
      body.append('nama_peserta_2', form.peserta2Nama)
      body.append('no_hp', `+62${form.noHp}`)
      body.append('asal_kota', form.asalKota)
      body.append('peserta_2_luar_gereja', String(form.peserta2LuarGereja))
      body.append('surat_gereja', form.suratGereja as File)
      body.append('foto_peserta_1', form.peserta1Foto as File)
      body.append('foto_peserta_2', form.peserta2Foto as File)
      body.append('bukti_bayar', form.buktiBayar as File)
      if (form.peserta2LuarGereja && form.peserta2Identitas) {
        body.append('peserta_2_identitas', form.peserta2Identitas)
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/badminton/register`, {
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
            Tim <span className="text-cream">{form.namaTim}</span> ({form.kategori}) sudah terdaftar.
            Panitia akan memverifikasi bukti pembayaran dan surat gereja dalam 1–2 hari kerja.
            Konfirmasi akan dikirim ke nomor +62{form.noHp}.
          </p>
          <a href={WHATSAPP_GROUPS.badminton.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-night font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer mb-4"
          >
            Gabung {WHATSAPP_GROUPS.badminton.nama} →
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
          <p className="uppercase tracking-[0.3em] text-xs text-violet font-semibold mt-6 mb-2">Pendaftaran</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Badminton</h1>

          <FormStepper current={step} />

          <div className="bg-night2 border border-cream/10 rounded-2xl p-6 sm:p-8 space-y-5">
            {step === 0 && (
              <>
                <RulesBanner rules={RULES_UMUM} />

                <label className="block">
                  <span className="text-sm text-cream/70 mb-1.5 block">Kategori <span className="text-gold">*</span></span>
                  <div className="grid grid-cols-3 gap-2">
                    {KATEGORI.map((k) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => set({ kategori: k })}
                        className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.kategori === k ? 'border-violet bg-violet/15 text-cream' : 'border-cream/15 text-cream/60 hover:border-cream/35'
                          }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  {errors.kategori && <span className="text-xs text-red-400 mt-1 block">{errors.kategori}</span>}
                </label>

                <TextField label="Nama Tim" name="namaTim" required value={form.namaTim}
                  onChange={(e) => set({ namaTim: e.target.value })} error={errors.namaTim}
                  placeholder="Bebas, misal: Smash Brothers" />

                <TextField label="Gereja Asal" name="gerejaAsal" required value={form.gerejaAsal}
                  onChange={(e) => set({ gerejaAsal: e.target.value })} error={errors.gerejaAsal}
                  placeholder="Misal: GPIN Way Halim" />

                <FileUpload label="Surat Pengantar dari Gereja" required file={form.suratGereja}
                  onChange={(f) => set({ suratGereja: f })} error={errors.suratGereja}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  hint="Foto atau PDF surat perwakilan gereja, untuk mengesahkan asal tim"
                  templateUrl={CONTOH_SURAT_URL} templateLabel="Unduh contoh surat (.docx)" />
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <TextField label="Nama Peserta 1" name="peserta1Nama" required value={form.peserta1Nama}
                      onChange={(e) => set({ peserta1Nama: e.target.value })} error={errors.peserta1Nama} />
                    <FileUpload label="Foto Peserta 1" required file={form.peserta1Foto}
                      onChange={(f) => set({ peserta1Foto: f })} accept="image/jpeg,image/png,image/webp" hint="Foto bebas"
                      error={errors.peserta1Foto} />
                  </div>
                  <div className="space-y-3">
                    <TextField label="Nama Peserta 2" name="peserta2Nama" required value={form.peserta2Nama}
                      onChange={(e) => set({ peserta2Nama: e.target.value })} error={errors.peserta2Nama} />
                    <FileUpload label="Foto Peserta 2" required file={form.peserta2Foto}
                      onChange={(f) => set({ peserta2Foto: f })} accept="image/jpeg,image/png,image/webp" hint="Foto bebas"
                      error={errors.peserta2Foto} />

                    <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.peserta2LuarGereja}
                        onChange={(e) => set({ peserta2LuarGereja: e.target.checked, peserta2Identitas: e.target.checked ? form.peserta2Identitas : null })}
                        className="mt-0.5 w-4 h-4 accent-violet flex-shrink-0"
                      />
                      <span className="text-xs text-cream/60 leading-relaxed">
                        Peserta 2 (partner) berasal dari <span className="text-cream/85">luar gereja</span> dan namanya
                        <span className="text-cream/85"> tidak</span> dicantumkan di Surat Pengantar
                      </span>
                    </label>

                    {form.peserta2LuarGereja && (
                      <FileUpload label="Foto Identitas Peserta 2" required file={form.peserta2Identitas}
                        onChange={(f) => set({ peserta2Identitas: f })} error={errors.peserta2Identitas}
                        accept="image/jpeg,image/png,image/webp,.pdf" hint="KTP / KTM / SIM / identitas resmi lain" />
                    )}
                  </div>
                </div>

                <PhoneField label="Nomor HP/WA" name="noHp" required value={form.noHp}
                  onChange={(v) => set({ noHp: v })} error={errors.noHp} />

                <TextField label="Asal Kota/Daerah" name="asalKota" required value={form.asalKota}
                  onChange={(e) => set({ asalKota: e.target.value })} error={errors.asalKota}
                  placeholder="Misal: Bandar Lampung" />
              </>
            )}

            {step === 2 && (
              <>
                <div className="rounded-lg bg-night border border-cream/10 p-5">
                  <p className="text-sm text-cream/60 mb-1">Biaya pendaftaran</p>
                  <p className="font-display text-2xl font-bold text-gold mb-4">Rp{HTM.toLocaleString('id-ID')} / tim</p>
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
              </>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={back}
              disabled={step === 0}
              className="px-5 py-2.5 rounded-full border border-cream/20 text-sm disabled:opacity-0 disabled:pointer-events-none hover:border-cream/50 transition-colors"
            >
              ← Kembali
            </button>
            {step < 2 ? (
              <button onClick={next} className="px-6 py-2.5 rounded-full bg-gold text-night font-semibold text-sm hover:scale-105 transition-transform">
                Lanjut →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-court text-night font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {submitting ? 'Mengirim…' : 'Kirim Pendaftaran'}
              </button>
            )}
          </div>
        </div>
      </div>
    </RequireLogin>
  )
}