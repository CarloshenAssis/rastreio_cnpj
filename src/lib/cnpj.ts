// CNPJ utilities — validation, formatting, parsing

export function stripCNPJ(cnpj: string): string {
  return (cnpj || "").replace(/\D/g, "");
}

export function formatCNPJ(cnpj: string): string {
  const c = stripCNPJ(cnpj).padStart(14, "0").slice(-14);
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
}

export function validateCNPJ(cnpj: string): boolean {
  const c = stripCNPJ(cnpj);
  if (c.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(c)) return false;

  const calc = (slice: string, weights: number[]) => {
    const sum = slice.split("").reduce((acc, d, i) => acc + parseInt(d, 10) * weights[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(c.slice(0, 12), w1);
  const d2 = calc(c.slice(0, 12) + d1, w2);
  return d1 === parseInt(c[12], 10) && d2 === parseInt(c[13], 10);
}

export function parseCNPJList(input: string): { valid: string[]; invalid: string[] } {
  const tokens = input.split(/[\s,;\n\r\t]+/).map((t) => t.trim()).filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const t of tokens) {
    const c = stripCNPJ(t);
    if (c.length !== 14) { invalid.push(t); continue; }
    if (seen.has(c)) continue;
    seen.add(c);
    if (validateCNPJ(c)) valid.push(c);
    else invalid.push(t);
  }
  return { valid, invalid };
}

export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTimeBR(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const REGIME_COLORS: Record<string, string> = {
  "MEI": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Simples": "text-success border-success/30 bg-success/10",
  "Lucro Presumido": "text-warning border-warning/30 bg-warning/10",
  "Lucro Real": "text-purple-400 border-purple-400/30 bg-purple-400/10",
  "Indefinido": "text-muted-foreground border-border bg-muted/30",
};

export const STATUS_COLORS: Record<string, string> = {
  "Ativa": "text-success border-success/30 bg-success/10",
  "Suspensa": "text-warning border-warning/30 bg-warning/10",
  "Inapta": "text-destructive border-destructive/30 bg-destructive/10",
  "Baixada": "text-muted-foreground border-border bg-muted/30",
  "Nula": "text-destructive border-destructive/30 bg-destructive/10",
  "Indefinido": "text-muted-foreground border-border bg-muted/30",
};
