import { useRef } from 'react'

interface FileUploadProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  error?: string
  accept?: string
  required?: boolean
  hint?: string
  /** URL contoh/template yang bisa diunduh peserta sebelum mengisi (mis. contoh surat gereja) */
  templateUrl?: string
  templateLabel?: string
}

export default function FileUpload({
  label,
  file,
  onChange,
  error,
  accept = 'image/*,.pdf',
  required,
  hint,
  templateUrl,
  templateLabel = 'Unduh contoh',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isImage = !!file && file.type?.startsWith('image/')
  const previewUrl = isImage && file ? URL.createObjectURL(file) : null

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-sm text-cream/70">
          {label} {required && <span className="text-gold">*</span>}
        </span>
        {templateUrl && (
          <a
            href={templateUrl}
            download
            className="text-xs text-violet hover:text-gold underline underline-offset-2 whitespace-nowrap"
          >
            ⬇ {templateLabel}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-lg border border-dashed px-4 py-4 flex items-center gap-4 text-left transition-colors ${
          error ? 'border-red-400/70' : 'border-cream/20 hover:border-violet/50'
        }`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
        ) : (
          <span className="w-14 h-14 rounded-md bg-night2 flex items-center justify-center text-cream/40 flex-shrink-0 text-xl">
            +
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm text-cream/85 truncate">
            {file ? file.name : 'Klik untuk pilih file'}
          </span>
          {hint && <span className="block text-xs text-cream/40 mt-0.5">{hint}</span>}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
      />
      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </div>
  )
}
