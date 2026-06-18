function HexIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hex-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C6FF7"/>
          <stop offset="100%" stopColor="#5340E8"/>
        </linearGradient>
        <linearGradient id="chk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#06D6A0"/>
        </linearGradient>
      </defs>
      <polygon points="32,4 56,17 56,47 32,60 8,47 8,17" fill="url(#hex-g)"/>
      <polygon points="32,7 53,19 53,45 32,57 11,45 11,19" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <path d="M38 22 C34 19 26 20 24 27 C22 34 26 42 33 42 C37 42 40 40 41 37" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <polyline points="30,32 34,37 44,25" stroke="url(#chk-g)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return <HexIcon className={className} />;
}

export function LogoFull({ iconClass = "h-8 w-8", textClass = "text-sm" }: { iconClass?: string; textClass?: string }) {
  return (
    <div className="flex items-center gap-2">
      <HexIcon className={iconClass} />
      <div>
        <div className={`font-bold tracking-tight leading-tight ${textClass}`}>
          <span className="text-foreground">CNPJ </span>
          <span className="text-[#10B981]">Brasil</span>
          <span className="text-[#7C6FF7]"> Track</span>
        </div>
      </div>
    </div>
  );
}
