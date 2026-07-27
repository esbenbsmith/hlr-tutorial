export default function HuslejenaevnLogo({ className }: { className?: string }) {
  return (
    <p className={`text-center font-bold tracking-tight text-[var(--accent)] ${className ?? ""}`}>
      huslejenaevn.dk
    </p>
  );
}
