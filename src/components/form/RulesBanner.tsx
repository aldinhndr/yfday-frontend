interface RulesBannerProps {
  title?: string
  rules: string[]
}

export default function RulesBanner({ title = 'Rules Umum', rules }: RulesBannerProps) {
  return (
    <div className="rounded-lg border border-gold/25 bg-gold/5 p-4">
      <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">{title}</p>
      <ul className="space-y-1.5">
        {rules.map((r, i) => (
          <li key={i} className="text-sm text-cream/75 flex gap-2">
            <span className="text-gold flex-shrink-0">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
