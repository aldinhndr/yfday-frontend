interface PhoneFieldProps {
    label: string
    name: string
    value: string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    required?: boolean
}

export default function PhoneField({ label, name, value, onChange, error, placeholder = '812-3456-7890', required }: PhoneFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Buang semua karakter selain angka, dan buang leading 0
        // (karena +62 sudah menggantikan 0 di depan nomor Indonesia)
        const digitsOnly = e.target.value.replace(/\D/g, '').replace(/^0+/, '')
        onChange(digitsOnly)
    }

    return (
        <label className="block">
            <span className="text-sm text-cream/70 mb-1.5 block">
                {label} {required && <span className="text-gold">*</span>}
            </span>
            <div
                className={`flex items-center rounded-lg bg-night border overflow-hidden focus-within:ring-2 focus-within:ring-violet/50 transition-colors ${error ? 'border-red-400/70' : 'border-cream/15'
                    }`}
            >
                <span className="flex items-center gap-1.5 pl-4 pr-3 py-2.5 text-cream/60 text-sm border-r border-cream/15 select-none">
                    🇮🇩 +62
                </span>
                <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-3 py-2.5 text-cream placeholder:text-cream/30 focus:outline-none"
                />
            </div>
            {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
        </label>
    )
}