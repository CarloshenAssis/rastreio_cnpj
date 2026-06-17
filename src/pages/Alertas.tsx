import { useAlerts } from "@/hooks/useAlerts";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { formatCNPJ, formatDateTimeBR } from "@/lib/cnpj";
import { cn } from "@/lib/utils";

const EVENT_LABELS: Record<string, string> = {
  status_change: "Mudança de Status",
  simples_entry: "Entrada no Simples",
  simples_exit: "Saída do Simples",
  cnae_change: "Mudança de CNAE",
  address_change: "Mudança de Endereço",
  partner_change: "Mudança de Sócios",
  company_closed: "Empresa Baixada",
  regime_change: "Mudança de Regime",
};

const EVENT_COLORS: Record<string, string> = {
  status_change: "text-warning",
  simples_entry: "text-success",
  simples_exit: "text-danger",
  cnae_change: "text-primary",
  address_change: "text-muted-foreground",
  partner_change: "text-primary",
  company_closed: "text-danger",
  regime_change: "text-warning",
};

export default function Alertas() {
  const { alerts, unread, loading, markRead, markAllRead } = useAlerts();

  return (
    <div>
      <PageHeader
        title="Central de Alertas"
        subtitle={unread > 0 ? `${unread} alerta(s) não lido(s)` : "Nenhum alerta pendente"}
        actions={
          unread > 0 ? (
            <Button
              onClick={markAllRead}
              variant="outline"
              size="sm"
              className="font-mono text-[11px] uppercase"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Marcar todos como lidos
            </Button>
          ) : null
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="terminal-card p-8 text-center font-mono text-xs text-muted-foreground">
            Carregando alertas…
          </div>
        ) : alerts.length === 0 ? (
          <div className="terminal-card p-12 flex flex-col items-center gap-3 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground/40" />
            <div className="font-mono text-xs text-muted-foreground">
              Nenhum alerta gerado ainda.
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/60">
              Os alertas aparecem automaticamente quando há mudanças nas empresas monitoradas.
            </div>
          </div>
        ) : (
          <div className="terminal-card divide-y divide-border/50">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 transition-colors",
                  !alert.read_at && "bg-primary/5 hover:bg-primary/10",
                  alert.read_at && "hover:bg-muted/10 opacity-70"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <Bell
                    className={cn(
                      "h-4 w-4",
                      EVENT_COLORS[alert.event_type] || "text-muted-foreground",
                      !alert.read_at && "animate-pulse"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {EVENT_LABELS[alert.event_type] || alert.event_type}
                    </Badge>
                    {!alert.read_at && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                    )}
                  </div>
                  <div className="font-sans text-sm text-foreground mb-1">{alert.description}</div>
                  {alert.cnpjs && (
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {formatCNPJ(alert.cnpjs.cnpj)}
                      {alert.cnpjs.razao_social && ` · ${alert.cnpjs.razao_social}`}
                    </div>
                  )}
                  <div className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                    {formatDateTimeBR(alert.created_at)}
                  </div>
                </div>
                {!alert.read_at && (
                  <Button
                    onClick={() => markRead(alert.id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground shrink-0"
                    title="Marcar como lido"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
