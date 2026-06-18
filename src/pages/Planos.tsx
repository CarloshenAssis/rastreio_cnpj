import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Zap, Star, Rocket, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  Free: <Zap className="h-5 w-5" />,
  Starter: <Star className="h-5 w-5" />,
  Pro: <Rocket className="h-5 w-5" />,
  Personalizado: <Infinity className="h-5 w-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  Free: "border-border",
  Starter: "border-primary/60",
  Pro: "border-primary",
  Personalizado: "border-amber-500/60",
};

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-destructive" : "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function UsageLine({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="font-mono text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-end gap-2">
        <span className="font-mono text-2xl tabular-nums text-foreground">{value}</span>
        {max === -1 ? (
          <span className="font-mono text-sm text-primary mb-0.5">ilimitado</span>
        ) : (
          <span className="font-mono text-sm text-muted-foreground mb-0.5">/ {max}</span>
        )}
      </div>
      {max !== -1 && <UsageBar value={value} max={max} />}
    </div>
  );
}

export default function Planos() {
  const { plan: currentPlan, usage, loading: planLoading } = usePlan();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("plans").select("*").order("price_cents");
      setPlans(data || []);
      setLoading(false);
    })();
  }, []);

  const handleSelectPlan = async (plan: any) => {
    if (plan.name === "Personalizado") return;
    if (plan.price_cents === 0) {
      toast.info("Você já está no plano gratuito.");
      return;
    }
    if (currentPlan?.name === plan.name) return;
    setSubscribing(plan.name);
    try {
      const { data, error } = await supabase.functions.invoke("mp-create-preference", {
        body: { plan_name: plan.name },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      window.location.href = data.init_point;
    } catch (e: any) {
      toast.error(e.message || "Erro ao iniciar pagamento.");
    } finally {
      setSubscribing(null);
    }
  };

  const handleRedeem = async () => {
    if (!accessCode.trim()) return;
    setRedeeming(true);
    const { data, error } = await supabase.rpc("redeem_access_code", { p_code: accessCode.trim() });
    setRedeeming(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Código inválido.");
      return;
    }
    toast.success(`Plano ${data.plan} ativado com sucesso!`);
    setAccessCode("");
    window.location.reload();
  };

  if (loading || planLoading) {
    return <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>;
  }

  const regularPlans = plans.filter((p) => p.name !== "Personalizado");
  const personalizado = plans.find((p) => p.name === "Personalizado");

  return (
    <div>
      <PageHeader title="Planos" subtitle="Escolha o plano ideal para sua operação" />

      <div className="p-6 space-y-6">
        {/* Uso atual */}
        <div className="terminal-card p-5">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
            Seu consumo — {new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageLine label="CNPJs consultados" value={usage.queriesThisMonth} max={currentPlan?.max_queries ?? 20} />
            <UsageLine label="CNPJs monitorados" value={usage.monitoredCount} max={currentPlan?.max_monitored ?? 10} />
            <UsageLine label="PDFs gerados" value={usage.pdfsThisMonth} max={currentPlan?.max_pdfs ?? 3} />
            <UsageLine label="Exports lote" value={usage.exportsThisMonth} max={currentPlan?.max_exports ?? 1} />
          </div>
        </div>

        {/* Cards Free / Starter / Pro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regularPlans.map((plan) => {
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
                  ) : plan.price_cents === -1 ? (
                    <div className="font-mono text-3xl font-bold">Sob consulta</div>
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
                  disabled={isCurrent || subscribing === plan.name}
                  className="font-mono text-xs uppercase w-full"
                  variant={plan.name === "Pro" ? "default" : "outline"}
                >
                  {subscribing === plan.name ? "Aguarde…" : isCurrent ? "Plano atual" : plan.price_cents === 0 ? "Usar grátis" : "Assinar"}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Plano Personalizado */}
        {personalizado && (
          <div className={cn(
            "terminal-card p-6 border-2 border-amber-500/60",
            currentPlan?.name === "Personalizado" && "ring-1 ring-amber-500/40"
          )}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Infinity className="h-5 w-5" />
                  <span className="font-mono text-sm font-semibold">Personalizado</span>
                  {currentPlan?.name === "Personalizado" && (
                    <Badge className="font-mono text-[10px] uppercase bg-amber-500/20 text-amber-400 border-amber-500/30">
                      Ativo
                    </Badge>
                  )}
                </div>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(Array.isArray(personalizado.features) ? personalizado.features : []).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 font-mono text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {currentPlan?.name !== "Personalizado" && (
                <div className="flex flex-col gap-2 min-w-[220px]">
                  <div className="font-mono text-xs text-muted-foreground">Código de acesso exclusivo</div>
                  <Input
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="EX: AB12CD34"
                    className="font-mono text-sm tracking-widest uppercase"
                    maxLength={8}
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={redeeming || !accessCode.trim()}
                    className="font-mono text-xs uppercase bg-amber-500 hover:bg-amber-400 text-black"
                  >
                    {redeeming ? "Verificando…" : "Resgatar código"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="terminal-card p-4 text-center font-mono text-xs text-muted-foreground">
          Integração com Mercado Pago em breve. Para upgrade imediato, entre em contato.
        </div>
      </div>
    </div>
  );
}
