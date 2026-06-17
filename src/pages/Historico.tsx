import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { formatCNPJ, formatDateTimeBR } from "@/lib/cnpj";
import { cn } from "@/lib/utils";

interface ChangeRow {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  cnpjs: { cnpj: string; razao_social: string | null } | null;
}

const FIELD_LABELS: Record<string, string> = {
  razao_social: "Razão Social",
  simples_nacional: "Simples Nacional",
  regime_tributario: "Regime Tributário",
  status_cadastral: "Status Cadastral",
  data_inicio_regime: "Data Início Regime",
  municipio: "Município",
  uf: "UF",
  porte: "Porte",
  nome_fantasia: "Nome Fantasia",
};

export default function Historico() {
  const [rows, setRows] = useState<ChangeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("company_changes")
        .select("id, field_name, old_value, new_value, changed_at, cnpjs(cnpj, razao_social)")
        .order("changed_at", { ascending: false })
        .limit(200);
      setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      r.cnpjs?.cnpj.includes(filter.replace(/\D/g, "")) ||
      r.cnpjs?.razao_social?.toLowerCase().includes(q) ||
      (FIELD_LABELS[r.field_name] || r.field_name).toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Histórico de Alterações"
        subtitle={`${rows.length} registros de auditoria`}
      />

      <div className="p-6 space-y-4">
        <div className="terminal-card p-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por CNPJ, razão social ou campo…"
              className="pl-8 font-mono text-xs h-8"
            />
          </div>
        </div>

        <div className="terminal-card overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">
              {rows.length === 0
                ? "Nenhuma alteração registrada ainda."
                : "Nenhum resultado para o filtro."}
            </div>
          ) : (
            <table className="data-table w-full">
              <thead className="bg-background-deep/40">
                <tr>
                  <th className="text-left px-4 py-2.5">Data</th>
                  <th className="text-left px-4 py-2.5">CNPJ</th>
                  <th className="text-left px-4 py-2.5">Razão Social</th>
                  <th className="text-left px-4 py-2.5">Campo</th>
                  <th className="text-left px-4 py-2.5">Antes → Depois</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDateTimeBR(r.changed_at)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                      {r.cnpjs ? formatCNPJ(r.cnpjs.cnpj) : "—"}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-xs max-w-[200px] truncate">
                      {r.cnpjs?.razao_social || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] bg-muted/40 px-1.5 py-0.5 rounded-sm">
                        {FIELD_LABELS[r.field_name] || r.field_name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className={cn("text-muted-foreground line-through", !r.old_value && "no-underline opacity-40")}>
                          {r.old_value || "—"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        <span className="text-primary font-medium">
                          {r.new_value || "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
