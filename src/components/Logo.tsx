export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0d1f0d"/>
      <circle cx="27" cy="27" r="13" stroke="#22c55e" strokeWidth="4.5" fill="none"/>
      <line x1="36.5" y1="36.5" x2="52" y2="52" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="23" cy="23" r="4" fill="#22c55e" opacity="0.25"/>
      <text x="21" y="32" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#22c55e" textAnchor="middle">BR</text>
    </svg>
  );
}
