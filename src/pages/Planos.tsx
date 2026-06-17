import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  Free: <Zap className="h-5 w-5" />,
  Starter: <Star className="h-5 w-5" />,
  Pro: <Rocket className="h-5 w-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  Free: "border-border",
  Starter: "border-primary/60",
  Pro: "border-primary",
};

export default function Planos() {
  const { plan: currentPlan, usage, loading: planLoading } = usePlan();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("plans").select("*").order("price_cents");
      setPlans(data || []);
      setLoading(false);
    })();
  }, []);

  const handleSelectPlan = (plan: any) => {
    if (plan.price_cents === 0) {
      toast.info("Você já está no plano gratuito.");
      return;
    }
    toast.info("Integração de pagamento em breve. Entre em contato para upgrade.");
  };

  if (loading || planLoading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Planos"
        subtitle="Escolha o plano ideal para sua operação"
      />

      <div className="p-6 space-y-6">
        {/* Uso atual */}
        <div className="terminal-card p-5">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
            Seu consumo — {new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-xs text-muted-foreground mb-1">Consultas realizadas</div>
              <div className="flex items-end gap-2">
                <span className="font-mono text-2xl tabular-nums text-foreground">
                  {usage.queriesThisMonth}
                </span>
                {currentPlan && currentPlan.max_queries !== -1 && (
                  <span className="font-mono text-sm text-muted-foreground mb-0.5">
                    / {currentPlan.max_queries}
                  </span>
                )}
                {currentPlan?.max_queries === -1 && (
                  <span className="font-mono text-sm text-primary mb-0.5">ilimitado</span>
                )}
              </div>
              {currentPlan && currentPlan.max_queries !== -1 && (
                <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      usage.queriesThisMonth / currentPlan.max_queries > 0.8
                        ? "bg-destructive"
                        : "bg-primary"
                    )}
                    style={{ width: `${Math.min(100, (usage.queriesThisMonth / currentPlan.max_queries) * 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <div className="font-mono text-xs text-muted-foreground mb-1">Empresas monitoradas</div>
              <div className="flex items-end gap-2">
                <span className="font-mono text-2xl tabular-nums text-foreground">
                  {usage.monitoredCount}
                </span>
                {currentPlan && currentPlan.max_monitored !== -1 && (
                  <span className="font-mono text-sm text-muted-foreground mb-0.5">
                    / {currentPlan.max_monitored}
                  </span>
                )}
                {currentPlan?.max_monitored === -1 && (
                  <span className="font-mono text-sm text-primary mb-0.5">ilimitado</span>
                )}
              </div>
              {currentPlan && currentPlan.max_monitored !== -1 && (
                <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      usage.monitoredCount / currentPlan.max_monitored > 0.8
                        ? "bg-destructive"
                        : "bg-primary"
                    )}
                    style={{ width: `${Math.min(100, (usage.monitoredCount / currentPlan.max_monitored) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.name === plan.name;
            const features: string[] = Array.isArray(plan.features) ? plan.features : [];
            return (
              <div
                key={plan.id}
                className={cn(
                  "terminal-card p-6 flex flex-col gap-4 border-2 transition-all",
                  PLAN_COLORS[plan.name] || "border-border",
                  isCurrent && "ring-1 ring-primary/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    {PLAN_ICONS[plan.name] || <Zap className="h-5 w-5" />}
                    <span className="font-mono text-sm font-semibold">{plan.name}</span>
                  </div>
                  {isCurrent && (
                    <Badge className="font-mono text-[10px] uppercase bg-primary/20 text-primary border-primary/30">
                      Atual
                    </Badge>
                  )}
                </div>

                <div>
                  {plan.price_cents === 0 ? (
                    <div className="font-mono text-3xl font-bold">Grátis</div>
                  ) : (
                    <div className="font-mono">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-3xl font-bold tabular-nums">
                        {(plan.price_cents / 100).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 flex-1">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 font-mono text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={cn(
                    "font-mono text-xs uppercase w-full",
                    plan.name === "Pro"
                      ? "bg-primary text-primary-foreground hover:bg-primary-glow"
                      : "variant-outline"
                  )}
                  variant={plan.name === "Pro" ? "default" : "outline"}
                >
                  {isCurrent ? "Plano atual" : plan.price_cents === 0 ? "Usar grátis" : "Assinar"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="terminal-card p-4 text-center font-mono text-xs text-muted-foreground">
          Integração com pagamentos (Stripe / Mercado Pago / Asaas) em breve.
          Para upgrade imediato, entre em contato.
        </div>
      </div>
    </div>
  );
}
