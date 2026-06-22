import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, StatCard } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Building2 } from "lucide-react";
import { formatCNPJ, formatDateTimeBR } from "@/lib/cnpj";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Counts {
  total: number;
  ativas: number;
  baixadas: number;
  changedThisMonth: number;
  simplesEntry: number;
  simplesExit: number;
  byStatus: Record<string, number>;
}
interface RecentChange {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  cnpjs: { cnpj: string; razao_social: string | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  Ativa: "#22c55e",
  Suspensa: "#f59e0b",
  Inapta: "#ef4444",
  Baixada: "#64748b",
};

const FIELD_LABELS: Record<string, string> = {
  razao_social: "Razão Social",
  simples_nacional: "Simples Nacional",
  status_cadastral: "Status",
  municipio: "Município",
  uf: "UF",
};

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>({
    total: 0, ativas: 0, baixadas: 0, changedThisMonth: 0,
    simplesEntry: 0, simplesExit: 0, byStatus: {},
  });
  const [recent, setRecent] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        { data: cnpjs },
        { data: changes },
        { data: recentRows },
        { data: simplesChanges },
      ] = await Promise.all([
        supabase.from("cnpjs").select("status_cadastral, simples_nacional"),
        supabase.from("company_changes").select("company_id").gte("changed_at", startOfMonth.toISOString()),
        supabase
          .from("company_changes")
          .select("id, field_name, old_value, new_value, changed_at, cnpjs(cnpj, razao_social)")
          .order("changed_at", { ascending: false })
          .limit(10),
        supabase
          .from("company_changes")
          .select("old_value, new_value")
          .eq("field_name", "simples_nacional")
          .gte("changed_at", startOfMonth.toISOString()),
      ]);

      const byStatus: Record<string, number> = {};

      let ativas = 0, baixadas = 0;
      (cnpjs || []).forEach((c: any) => {
        const s = c.status_cadastral || "Indefinido";
        byStatus[s] = (byStatus[s] || 0) + 1;
        if (s === "Ativa") ativas++;
        if (s === "Baixada") baixadas++;
      });

      const changedSet = new Set((changes || []).map((c: any) => c.company_id));
      const simplesEntry = (simplesChanges || []).filter((c: any) => c.new_value === "true").length;
      const simplesExit = (simplesChanges || []).filter((c: any) => c.new_value === "false").length;

      setCounts({
        total: cnpjs?.length || 0,
        ativas, baixadas,
        changedThisMonth: changedSet.size,
        simplesEntry, simplesExit,
        byStatus,
      });
      setRecent((recentRows as any) || []);
      setLoading(false);
    })();
  }, []);

  const statusChartData = Object.entries(counts.byStatus).map(([name, value]) => ({
    name, value, fill: STATUS_COLORS[name] || "#64748b",
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão executiva do monitoramento fiscal"
        actions={
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase tracking-wider">
            <Link to="/consulta"><Plus className="h-3.5 w-3.5 mr-1.5" />Nova Consulta</Link>
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Cards principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Monitorados" value={loading ? "—" : counts.total} accent="primary" />
          <StatCard label="Ativas" value={loading ? "—" : counts.ativas} accent="default"
            subValue={counts.total > 0 ? `${Math.round((counts.ativas / counts.total) * 100)}%` : ""} />
          <StatCard label="Baixadas" value={loading ? "—" : counts.baixadas}
            accent={counts.baixadas > 0 ? "danger" : "default"} />
          <StatCard label="Alterações/mês" value={loading ? "—" : counts.changedThisMonth}
            accent={counts.changedThisMonth > 0 ? "danger" : "default"} />
          <StatCard label="Entradas Simples" value={loading ? "—" : counts.simplesEntry} accent="default" />
          <StatCard label="Saídas Simples" value={loading ? "—" : counts.simplesExit}
            accent={counts.simplesExit > 0 ? "danger" : "default"} />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-4">
          <div className="terminal-card p-5">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Distribuição por Status
            </div>
            {loading || statusChartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {loading ? "Carregando…" : "Sem dados"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ fontFamily: "monospace", fontSize: 10 }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontFamily: "monospace", fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Últimas alterações */}
        <div className="terminal-card">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Últimas 10 alterações detectadas
              </div>
            </div>
            <Link to="/historico" className="font-mono text-[10px] text-primary hover:underline">
              Ver histórico completo →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">
              Nenhuma alteração detectada ainda. Consulte CNPJs para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full min-w-[600px]">
                <thead className="bg-background-deep/40">
                  <tr>
                    <th className="text-left px-4 py-2.5">CNPJ</th>
                    <th className="text-left px-4 py-2.5">Razão Social</th>
                    <th className="text-left px-4 py-2.5">Campo</th>
                    <th className="text-left px-4 py-2.5">Antes</th>
                    <th className="text-left px-4 py-2.5">Depois</th>
                    <th className="text-left px-4 py-2.5">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 tabular-nums">{r.cnpjs ? formatCNPJ(r.cnpjs.cnpj) : "—"}</td>
                      <td className="px-4 py-2.5 font-sans text-xs">{r.cnpjs?.razao_social || "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{FIELD_LABELS[r.field_name] || r.field_name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs line-through">{r.old_value || "—"}</td>
                      <td className="px-4 py-2.5 text-primary text-xs font-medium">{r.new_value || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDateTimeBR(r.changed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
