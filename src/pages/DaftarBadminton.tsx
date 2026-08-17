// src/pages/DaftarBadminton.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import TextField from '../components/form/TextField'
import PhoneField from '../components/form/PhoneField'
import FileUpload from '../components/form/FileUpload'
import FormStepper from '../components/form/FormStepper'
import RulesBanner from '../components/form/RulesBanner'
import RequireLogin from '../components/RequireLogin'
import GpinQuiz from '../components/form/GpinQuiz'
import { useAuth } from '../context/AuthContext'

import { REKENING } from '../constants'
import { WHATSAPP_GROUPS } from '../lib/WAGroups'
import NavbarSimple from '../components/NavbarLogo'

const KATEGORI = ['Ganda Putra', 'Ganda Putri', 'Ganda Campuran'] as const
type Kategori = (typeof KATEGORI)[number] | ''

const KATEGORI_TO_API: Record<(typeof KATEGORI)[number], string> = {
  'Ganda Putra': 'ganda_putra',
  'Ganda Putri': 'ganda_putri',
  'Ganda Campuran': 'campuran',
}

const HTM = 75000
const CONTOH_SURAT_URL = '/templates/contoh-surat-pengantar-gereja.docx'

interface BadmintonForm {
  isGpin: boolean
  isGpinVerified: boolean

  kategori: Kategori
  namaTim: string
  gerejaAsal: string
  suratGereja: File | null

  peserta1Nama: string
  peserta1Foto: File | null

  peserta2Nama: string
  peserta2Foto: File | null
  partnerLuarGpin: boolean
  peserta2LuarGereja: boolean
  peserta2Identitas: File | null

  noHp: string
  asalKota: string
  buktiBayar: File | null
}

const emptyForm: BadmintonForm = {
  isGpin: false,
  isGpinVerified: false,

  kategori: '',
  namaTim: '',
  gerejaAsal: '',
  suratGereja: null,
  peserta1Nama: '',
  peserta1Foto: null,
  peserta2Nama: '',
  peserta2Foto: null,
  partnerLuarGpin: false,
  peserta2LuarGereja: false,
  peserta2Identitas: null,
  noHp: '',
  asalKota: '',
  buktiBayar: null,
}

type FormErrors = Partial<Record<keyof BadmintonForm | 'gpinError', string>>

export default function DaftarBadminton() {
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<BadmintonForm>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (patch: Partial<BadmintonForm>) => setForm((f) => ({ ...f, ...patch }))

  // Helper boolean untuk mengecek apakah form sedang dikunci
  const isLocked = form.isGpin && !form.isGpinVerified

  const handleLockedClick = () => {
    if (isLocked) {
      setErrors((e) => ({
        ...e,
        gpinError: 'Jawab dan selesaikan verifikasi Hamba Tuhan di atas terlebih dahulu!',
      }))
    }
  }

  const validateStep = (s: number): FormErrors => {
    const e: FormErrors = {}
    if (s === 0) {
      if (form.isGpin && !form.isGpinVerified) {
        e.gpinError = 'Jawab dan selesaikan verifikasi Hamba Tuhan di atas terlebih dahulu!'
        return e
      }

      if (!form.kategori) e.kategori = 'Pilih kategori terlebih dahulu'
      if (!form.namaTim.trim()) e.namaTim = 'Nama tim wajib diisi'

      if (!form.isGpin) {
        if (!form.gerejaAsal.trim()) e.gerejaAsal = 'Gereja asal wajib diisi'
        if (!form.suratGereja) e.suratGereja = 'Surat pengantar gereja wajib diunggah'
      }
    }

    if (s === 1) {
      if (!form.peserta1Nama.trim()) e.peserta1Nama = 'Nama peserta 1 wajib diisi'
      if (!form.isGpin && !form.peserta1Foto) e.peserta1Foto = 'Foto peserta 1 wajib diunggah'

      if (!form.peserta2Nama.trim()) e.peserta2Nama = 'Nama peserta 2 wajib diisi'

      if (form.isGpin) {
        if (form.partnerLuarGpin && !form.peserta2Foto) {
          e.peserta2Foto = 'Foto peserta 2 wajib diunggah karena partner dari luar GPIN'
        }
      } else {
        if (!form.peserta2Foto) e.peserta2Foto = 'Foto peserta 2 wajib diunggah'
        if (form.peserta2LuarGereja && !form.peserta2Identitas) {
          e.peserta2Identitas = 'Foto identitas wajib diunggah'
        }
      }

      if (!form.noHp.trim()) e.noHp = 'Nomor WhatsApp kontak tim wajib diisi'
      else if (form.noHp.length < 8) e.noHp = 'Nomor HP tidak valid'

      if (!form.isGpin && !form.asalKota.trim()) e.asalKota = 'Asal kota wajib diisi'
    }

    if (s === 2 && !form.buktiBayar) {
      e.buktiBayar = 'Unggah bukti pembayaran transfer terlebih dahulu'
    }

    return e
  }

  const next = () => {
    const errs = validateStep(step)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep((s) => Math.min(s + 1, 2))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    // GUARD CLAUSE: Cegah eksekusi ganda jika sedang dalam proses submit
    if (submitting) return

    const errs = validateStep(2)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitError(null)
    setSubmitting(true)

    try {
      const body = new FormData()
      body.append('kategori', KATEGORI_TO_API[form.kategori as (typeof KATEGORI)[number]])
      body.append('nama_team', form.namaTim.trim())
      body.append('is_gpin', String(form.isGpin))
      body.append('no_hp', `+62${form.noHp.trim()}`)
      body.append('nama_peserta_1', form.peserta1Nama.trim())
      body.append('nama_peserta_2', form.peserta2Nama.trim())
      body.append('bukti_bayar', form.buktiBayar as File)

      if (form.isGpin) {
        body.append('gpin_gereja', form.gerejaAsal.trim())
        body.append('partner_luar_gpin', String(form.partnerLuarGpin))
        if (form.peserta1Foto) body.append('foto_peserta_1', form.peserta1Foto)
        if (form.peserta2Foto) body.append('foto_peserta_2', form.peserta2Foto)
        if (form.partnerLuarGpin && form.peserta2Identitas) {
          body.append('peserta_2_identitas', form.peserta2Identitas)
        }
      } else {
        body.append('gereja_asal', form.gerejaAsal.trim())
        body.append('asal_kota', form.asalKota.trim())
        body.append('peserta_2_luar_gereja', String(form.peserta2LuarGereja))
        body.append('surat_gereja', form.suratGereja as File)
        body.append('foto_peserta_1', form.peserta1Foto as File)
        body.append('foto_peserta_2', form.peserta2Foto as File)
        if (form.peserta2LuarGereja && form.peserta2Identitas) {
          body.append('peserta_2_identitas', form.peserta2Identitas)
        }
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/badminton/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.detail || 'Gagal mengirim pendaftaran, coba lagi ya')
      }

      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
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
            Tim <span className="text-cream font-medium">{form.namaTim}</span> ({form.kategori}) sudah terdaftar {form.isGpin ? '(Jalur Khusus GPIN)' : ''}.
            Panitia akan memverifikasi data dalam 1–2 hari kerja.
          </p>
          <a
            href={WHATSAPP_GROUPS.badminton.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-night font-semibold hover:scale-105 transition-transform mb-4"
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
            {/* ================= STEP 0 ================= */}
            {step === 0 && (
              <>
                {/* TOGGLE GPIN */}
                <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gold block">Jalur Khusus GPIN</span>
                    <span className="text-xs text-cream/60">Aktifkan jika tim kamu berasal dari jemaat GPIN.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isGpin}
                      onChange={(e) =>
                        set({
                          isGpin: e.target.checked,
                          isGpinVerified: false,
                          gerejaAsal: '',
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-cream/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>

                {/* MODUL KUIS GPIN */}
                {form.isGpin && (
                  <GpinQuiz
                    selectedChurch={form.gerejaAsal}
                    isVerified={form.isGpinVerified}
                    onSelectChurch={(church) => set({ gerejaAsal: church, isGpinVerified: false })}
                    onVerified={(church) => set({ isGpinVerified: true, gerejaAsal: church })}
                  />
                )}

                {errors.gpinError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
                    <span>🔒</span> {errors.gpinError}
                  </div>
                )}

                {/* AREA FORM DIBAWAH KUIS (DILOCK JIKA BELUM VERIFIKASI GPIN) */}
                <div className="relative">
                  {/* OVERLAY PENGUNCI / LOCK */}
                  {isLocked && (
                    <div
                      onClick={handleLockedClick}
                      className="absolute inset-0 z-20 bg-night/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-not-allowed border border-dashed border-gold/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center text-lg mb-2 shadow-md">
                        🔒
                      </div>
                      <p className="text-xs font-bold text-cream">Form Terkunci</p>
                      <p className="text-[11px] text-cream/50 max-w-xs mt-0.5">
                        Selesaikan verifikasi nama Hamba Tuhan GPIN di atas untuk membuka formulir ini.
                      </p>
                    </div>
                  )}

                  <div className={`space-y-5 transition-all ${isLocked ? 'opacity-30 pointer-events-none select-none' : 'opacity-100'}`}>
                    {!form.isGpin && (
                      <RulesBanner
                        rules={[
                          'Minimal salah satu peserta (Peserta 1) harus berasal dari gereja yang mengeluarkan Surat Pengantar.',
                          'Partner (Peserta 2) boleh berasal dari luar gereja dengan melampirkan identitas.',
                        ]}
                      />
                    )}

                    {/* PILIH KATEGORI */}
                    <label className="block">
                      <span className="text-sm text-cream/70 mb-1.5 block">Kategori <span className="text-gold">*</span></span>
                      <div className="grid grid-cols-3 gap-2">
                        {KATEGORI.map((k) => (
                          <button
                            type="button"
                            key={k}
                            onClick={() => set({ kategori: k })}
                            className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.kategori === k
                              ? 'border-violet bg-violet/15 text-cream font-semibold'
                              : 'border-cream/15 text-cream/60 hover:border-cream/35'
                              }`}
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                      {errors.kategori && <span className="text-xs text-red-400 mt-1 block">{errors.kategori}</span>}
                    </label>

                    <TextField
                      label="Nama Tim"
                      name="namaTim"
                      required
                      value={form.namaTim}
                      onChange={(e) => set({ namaTim: e.target.value })}
                      error={errors.namaTim}
                      placeholder="Misal: Smash Brothers"
                    />

                    {!form.isGpin && (
                      <>
                        <TextField
                          label="Gereja Asal"
                          name="gerejaAsal"
                          required
                          value={form.gerejaAsal}
                          onChange={(e) => set({ gerejaAsal: e.target.value })}
                          error={errors.gerejaAsal}
                          placeholder="Misal: GBI Sukarame"
                        />

                        <FileUpload
                          label="Surat Pengantar dari Gereja"
                          required
                          file={form.suratGereja}
                          onChange={(f) => set({ suratGereja: f })}
                          error={errors.suratGereja}
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          hint="Foto atau PDF surat pengantar dari gereja asal"
                          templateUrl={CONTOH_SURAT_URL}
                          templateLabel="Unduh contoh surat (.docx)"
                        />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* PESERTA 1 */}
                  <div className="space-y-3 bg-night/50 p-4 rounded-xl border border-cream/10">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Peserta 1 (Kapten)</h4>
                    <TextField
                      label="Nama Peserta 1"
                      name="peserta1Nama"
                      required
                      value={form.peserta1Nama}
                      onChange={(e) => set({ peserta1Nama: e.target.value })}
                      error={errors.peserta1Nama}
                    />
                    <FileUpload
                      label={`Foto Peserta 1 ${form.isGpin ? '(Opsional)' : ''}`}
                      required={!form.isGpin}
                      file={form.peserta1Foto}
                      onChange={(f) => set({ peserta1Foto: f })}
                      accept="image/jpeg,image/png,image/webp"
                      hint="Foto bebas rapi"
                      error={errors.peserta1Foto}
                    />
                  </div>

                  {/* PESERTA 2 */}
                  <div className="space-y-3 bg-night/50 p-4 rounded-xl border border-cream/10">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Peserta 2 (Partner)</h4>
                    <TextField
                      label="Nama Peserta 2"
                      name="peserta2Nama"
                      required
                      value={form.peserta2Nama}
                      onChange={(e) => set({ peserta2Nama: e.target.value })}
                      error={errors.peserta2Nama}
                    />

                    {form.isGpin ? (
                      <div className="space-y-3 pt-1">
                        <label className="flex items-center justify-between p-2.5 rounded-lg bg-night2 border border-cream/10 cursor-pointer">
                          <span className="text-xs text-cream/70">Partner dari Luar GPIN?</span>
                          <input
                            type="checkbox"
                            checked={form.partnerLuarGpin}
                            onChange={(e) => set({ partnerLuarGpin: e.target.checked })}
                            className="w-4 h-4 accent-gold"
                          />
                        </label>

                        <FileUpload
                          label={`Foto Peserta 2 ${form.partnerLuarGpin ? '(Wajib)' : '(Opsional)'}`}
                          required={form.partnerLuarGpin}
                          file={form.peserta2Foto}
                          onChange={(f) => set({ peserta2Foto: f })}
                          accept="image/jpeg,image/png,image/webp"
                          hint="Foto bebas rapi"
                          error={errors.peserta2Foto}
                        />

                        {form.partnerLuarGpin && (
                          <FileUpload
                            label="Kartu Identitas Partner (Opsional)"
                            file={form.peserta2Identitas}
                            onChange={(f) => set({ peserta2Identitas: f })}
                            accept="image/jpeg,image/png,image/webp,.pdf"
                            hint="KTP / KTM / SIM partner"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <FileUpload
                          label="Foto Peserta 2"
                          required
                          file={form.peserta2Foto}
                          onChange={(f) => set({ peserta2Foto: f })}
                          accept="image/jpeg,image/png,image/webp"
                          hint="Foto bebas rapi"
                          error={errors.peserta2Foto}
                        />

                        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.peserta2LuarGereja}
                            onChange={(e) =>
                              set({
                                peserta2LuarGereja: e.target.checked,
                                peserta2Identitas: e.target.checked ? form.peserta2Identitas : null,
                              })
                            }
                            className="mt-0.5 w-4 h-4 accent-violet flex-shrink-0"
                          />
                          <span className="text-xs text-cream/60 leading-relaxed">
                            Partner berasal dari <span className="text-cream/85">luar gereja</span>
                          </span>
                        </label>

                        {form.peserta2LuarGereja && (
                          <FileUpload
                            label="Foto Identitas Peserta 2"
                            required
                            file={form.peserta2Identitas}
                            onChange={(f) => set({ peserta2Identitas: f })}
                            error={errors.peserta2Identitas}
                            accept="image/jpeg,image/png,image/webp,.pdf"
                            hint="KTP / KTM / SIM resmi"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>

                <PhoneField
                  label="Nomor WhatsApp Kontak Tim"
                  name="noHp"
                  required
                  value={form.noHp}
                  onChange={(v) => set({ noHp: v })}
                  error={errors.noHp}
                />

                {!form.isGpin && (
                  <TextField
                    label="Asal Kota/Daerah"
                    name="asalKota"
                    required
                    value={form.asalKota}
                    onChange={(e) => set({ asalKota: e.target.value })}
                    error={errors.asalKota}
                    placeholder="Misal: Bandar Lampung"
                  />
                )}
              </>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <>
                <div className="rounded-lg bg-night border border-cream/10 p-5">
                  <p className="text-sm text-cream/60 mb-1">Biaya pendaftaran {form.isGpin ? '(Jalur GPIN)' : ''}</p>
                  <p className="font-display text-2xl font-bold text-gold mb-4">Rp{HTM.toLocaleString('id-ID')} / tim</p>
                  <p className="text-sm text-cream/60 mb-1">Transfer ke</p>
                  <p className="text-cream font-semibold">{REKENING.bank} — {REKENING.nomor}</p>
                  <p className="text-cream/60 text-sm">a.n. {REKENING.atasNama}</p>
                </div>

                <FileUpload
                  label="Bukti Pembayaran"
                  required
                  file={form.buktiBayar}
                  onChange={(f) => set({ buktiBayar: f })}
                  error={errors.buktiBayar}
                  accept="image/jpeg,image/png,image/webp"
                  hint="Screenshot atau foto struk transfer"
                />

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
              <button
                onClick={next}
                className="px-6 py-2.5 rounded-full bg-gold text-night font-semibold text-sm hover:scale-105 transition-transform"
              >
                Lanjut →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-court text-night font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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