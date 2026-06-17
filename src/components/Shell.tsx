import { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="border-b border-border bg-background-deep/50 px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="font-mono text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, accent, subValue }: { label: string; value: string | number; accent?: "default" | "danger" | "success" | "primary"; subValue?: string }) {
  const colorMap = {
    default: "text-foreground",
    danger: "text-destructive",
    success: "text-success",
    primary: "text-primary",
  };
  return (
    <div className="terminal-card p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{label}</div>
      <div className={`font-mono text-3xl font-semibold tabular-nums ${colorMap[accent || "default"]}`}>{value}</div>
      {subValue && <div className="font-mono text-[10px] text-muted-foreground mt-1">{subValue}</div>}
    </div>
  );
}
