export default function HouseIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 180" aria-hidden="true" className={className}>
      <circle cx="100" cy="90" r="85" className="fill-[var(--illustration-light)]" opacity="0.15" />
      <circle cx="172" cy="26" r="13" className="fill-[var(--illustration-light)]" opacity="0.6" />
      <ellipse cx="100" cy="167" rx="68" ry="7" className="fill-[var(--illustration-dark)]" opacity="0.15" />

      {/* chimney, drawn before the roof so the roofline covers its base */}
      <rect x="120" y="18" width="14" height="45" className="fill-[var(--illustration-dark)]" />

      {/* roof, split two-tone for an abstract folded look */}
      <polygon points="40,100 100,100 100,35" className="fill-[var(--illustration-dark)]" />
      <polygon points="100,100 160,100 100,35" className="fill-[var(--illustration-mid)]" />

      {/* body, split two-tone */}
      <rect x="50" y="100" width="50" height="65" className="fill-[var(--illustration-mid)]" />
      <rect x="100" y="100" width="50" height="65" className="fill-[var(--illustration-dark)]" />

      <rect x="62" y="114" width="22" height="22" rx="2" className="fill-[var(--illustration-glass)]" />
      <rect x="116" y="114" width="22" height="22" rx="2" className="fill-[var(--illustration-glass)]" />
      <rect x="91" y="137" width="18" height="28" rx="2" className="fill-[var(--illustration-light)]" />
    </svg>
  );
}
