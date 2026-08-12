const steps = ['Tim & Gereja', 'Data Peserta', 'Pembayaran']

interface FormStepperProps {
  current: number
}

export default function FormStepper({ current }: FormStepperProps) {
  return (
    <div className="flex items-center mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-semibold flex-shrink-0 ${
                i < current ? 'bg-court text-night' : i === current ? 'bg-gold text-night' : 'bg-night2 text-cream/40 border border-cream/15'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </span>
            <span className={`text-sm hidden sm:inline ${i === current ? 'text-cream' : 'text-cream/40'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-px flex-1 mx-3 ${i < current ? 'bg-court/60' : 'bg-cream/10'}`} />}
        </div>
      ))}
    </div>
  )
}
