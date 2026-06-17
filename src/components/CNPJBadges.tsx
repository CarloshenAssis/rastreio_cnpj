import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { REGIME_COLORS, STATUS_COLORS } from "@/lib/cnpj";

export function RegimeBadge({ regime }: { regime?: string | null }) {
  const v = regime || "Indefinido";
  return (
    <Badge variant="outline" className={cn("font-mono text-[10px] uppercase tracking-wider rounded-sm", REGIME_COLORS[v] || REGIME_COLORS["Indefinido"])}>
      {v}
    </Badge>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const v = status || "Indefinido";
  return (
    <Badge variant="outline" className={cn("font-mono text-[10px] uppercase tracking-wider rounded-sm", STATUS_COLORS[v] || STATUS_COLORS["Indefinido"])}>
      {v}
    </Badge>
  );
}

export function SimplesBadge({ simples }: { simples?: boolean | null }) {
  if (simples === null || simples === undefined)
    return <span className="font-mono text-[10px] text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={cn(
      "font-mono text-[10px] uppercase tracking-wider rounded-sm",
      simples ? "text-success border-success/30 bg-success/10" : "text-muted-foreground border-border bg-muted/30"
    )}>
      {simples ? "Sim" : "Não"}
    </Badge>
  );
}
