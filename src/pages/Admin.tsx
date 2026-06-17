import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, StatCard } from "@/components/Shell";
import { formatDateTimeBR } from "@/lib/cnpj";
import { Shield, Users, Activity, AlertTriangle } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCnpjs: number;
  totalAlerts: number;
  totalChanges: number;
}

interface AuditRow {
  id: string;
  action: string;
  metadata: any;
  created_at: string;
  user_id: string | null;
}

export default function Admin() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCnpjs: 0, totalAlerts: 0, totalChanges: 0 });
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [
        { count: totalCnpjs },
        { count: totalAlerts },
        { count: totalChanges },
        { data: auditLogs },
      ] = await Promise.all([
        supabase.from("cnpjs").select("*", { count: "exact", head: true }),
        supabase.from("alerts").select("*", { count: "exact", head: true }),
        supabase.from("company_changes").select("*", { count: "exact", head: true }),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      setStats({
        totalUsers: 0,
        totalCnpjs: totalCnpjs || 0,
        totalAlerts: totalAlerts || 0,
        totalChanges: totalChanges || 0,
      });
      setLogs((auditLogs as any) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Painel Administrativo"
        subtitle="Visão geral da plataforma"
        actions={
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-warning/10 border border-warning/30 px-3 py-1.5 rounded-sm">
            <Shield className="h-3 w-3 text-warning" />
            Acesso restrito
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="CNPJs na Plataforma" value={loading ? "—" : stats.totalCnpjs} accent="primary" />
          <StatCard label="Alertas Gerados" value={loading ? "—" : stats.totalAlerts} accent="default" />
          <StatCard label="Alterações Auditadas" value={loading ? "—" : stats.totalChanges} accent="default" />
          <StatCard label="Logs de Auditoria" value={loading ? "—" : logs.length} accent="default" />
        </div>

        <div className="terminal-card">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Log de Auditoria
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">
              Nenhum log registrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead className="bg-background-deep/40">
                  <tr>
                    <th className="text-left px-4 py-2.5">Data</th>
                    <th className="text-left px-4 py-2.5">Ação</th>
                    <th className="text-left px-4 py-2.5">Usuário</th>
                    <th className="text-left px-4 py-2.5">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatDateTimeBR(log.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[11px] bg-muted/40 px-1.5 py-0.5 rounded-sm">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground truncate max-w-[160px]">
                        {log.user_id ? log.user_id.slice(0, 8) + "…" : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground max-w-[200px] truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="terminal-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Funcionalidades admin — Roadmap
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Gerenciamento de usuários e assinaturas",
              "Painel de consumo por usuário",
              "Controle de limites por plano",
              "Logs de erro e monitoramento",
              "Gerenciamento de CNPJs da plataforma",
              "Relatórios de uso e receita",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/70">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
