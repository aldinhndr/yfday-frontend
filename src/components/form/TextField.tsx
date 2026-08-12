interface TextFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
}

export default function TextField({ label, name, value, onChange, error, type = 'text', placeholder, required }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-cream/70 mb-1.5 block">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg bg-night border px-4 py-2.5 text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-violet/50 transition-colors ${error ? 'border-red-400/70' : 'border-cream/15'
          }`}
      />
      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </label>
  )
}
