import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Zap, Star, Rocket, Infinity, AlertCircle, Clock } from "lucide-react";
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

// fallback hardcoded caso a query falhe
const FALLBACK_PLANS = [
  {
    id: "free", name: "Free", price_cents: 0,
    features: ["5 consultas/mês", "Sem monitoramento", "Sem PDFs", "Sem exports"],
  },
  {
    id: "starter", name: "Starter", price_cents: 1990,
    features: [
      "100 CNPJs consultados/mês", "50 empresas monitoradas",
      "50 relatórios PDF/mês", "10 exports/mês",
      "Alertas por e-mail", "Tags e favoritos",
      "Monitoramento mensal e quinzenal",
    ],
  },
  {
    id: "pro", name: "Pro", price_cents: 4490,
    features: [
      "2.000 CNPJs consultados/mês", "500 empresas monitoradas",
      "100 relatórios PDF/mês", "50 exports/mês",
      "Alertas por e-mail", "Tags e favoritos",
      "Todas as frequências de monitoramento",
      "Monitora regime, status, endereço e sócios",
    ],
  },
];

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
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
      const { data, error } = await supabase.from("plans").select("*").order("price_cents");
      if (error || !data?.length) {
        setPlans(FALLBACK_PLANS);
      } else {
        setPlans(data);
      }
      setLoading(false);
    })();
  }, []);

  const handleSelectPlan = async (plan: any) => {
    if (plan.name === "Personalizado") return;
    if (plan.price_cents === 0) {
      toast.info("O plano Free é gratuito mas muito limitado. Recomendamos o Starter.");
      return;
    }

    setSubscribing(plan.name);
    try {
      const { data, error } = await supabase.functions.invoke("mp-create-preference", {
        body: { plan_name: plan.name },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      if (!data?.init_point) throw new Error("Link de pagamento não retornado.");
      window.location.href = data.init_point;
    } catch (e: any) {
      toast.error(e.message || "Erro ao iniciar pagamento. Tente novamente.");
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
      toast.error(data?.error || error?.message || "Código inválido ou já utilizado.");
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
  const isTrial = usage.isTrial;
  const trialDaysLeft = usage.trialDaysLeft;

  return (
    <div>
      <PageHeader title="Planos" subtitle="Escolha o plano ideal para sua operação" />

      <div className="p-4 sm:p-6 space-y-6">

        {/* Banner de trial ativo */}
        {isTrial && (
          <div className={cn(
            "terminal-card p-4 flex items-start gap-3 border-2",
            (trialDaysLeft ?? 99) <= 1 ? "border-destructive/40 bg-destructive/5" : "border-amber-500/40 bg-amber-500/5"
          )}>
            <Clock className={cn("h-4 w-4 mt-0.5 shrink-0", (trialDaysLeft ?? 99) <= 1 ? "text-destructive" : "text-amber-400")} />
            <div>
              <p className={cn("font-mono text-sm font-semibold", (trialDaysLeft ?? 99) <= 1 ? "text-destructive" : "text-amber-400")}>
                {trialDaysLeft === 0
                  ? "Seu trial expira hoje!"
                  : `Trial gratuito — ${trialDaysLeft} dia${trialDaysLeft === 1 ? "" : "s"} restante${trialDaysLeft === 1 ? "" : "s"}`}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Você está testando o plano Starter gratuitamente. Assine abaixo para continuar com acesso completo após o trial.
              </p>
            </div>
          </div>
        )}

        {/* Uso atual */}
        <div className="terminal-card p-5">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
            Seu consumo — {new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}
            {currentPlan && (
              <span className="ml-2 text-primary normal-case">· Plano {currentPlan.name}{isTrial ? " (trial)" : ""}</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageLine label="CNPJs consultados" value={usage.queriesThisMonth} max={currentPlan?.max_queries ?? 20} />
            <UsageLine label="CNPJs monitorados" value={usage.monitoredCount} max={currentPlan?.max_monitored ?? 10} />
            <UsageLine label="PDFs gerados" value={usage.pdfsThisMonth} max={currentPlan?.max_pdfs ?? 3} />
            <UsageLine label="Exports lote" value={usage.exportsThisMonth} max={currentPlan?.max_exports ?? 1} />
          </div>
        </div>

        {/* Cards Free / Starter / Pro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularPlans.map((plan) => {
            // Em trial, o plano "atual" não deve bloquear o botão de assinar
            const isPaidCurrent = currentPlan?.name === plan.name && !isTrial;
            const features: string[] = Array.isArray(plan.features) ? plan.features : [];
            const isPro = plan.name === "Pro";
            const isFree = plan.price_cents === 0;

            let btnLabel = "Assinar";
            if (subscribing === plan.name) btnLabel = "Aguarde…";
            else if (isPaidCurrent) btnLabel = "Plano atual";
            else if (isFree) btnLabel = "Plano gratuito";
            else if (isTrial && currentPlan?.name === plan.name) btnLabel = "Assinar este plano";

            return (
              <div
                key={plan.id}
                className={cn(
                  "terminal-card p-6 flex flex-col gap-4 border-2 transition-all",
                  PLAN_COLORS[plan.name] || "border-border",
                  isPaidCurrent && "ring-1 ring-primary/40",
                  isPro && !isPaidCurrent && "ring-1 ring-primary/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    {PLAN_ICONS[plan.name] || <Zap className="h-5 w-5" />}
                    <span className="font-mono text-sm font-semibold">{plan.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {isPro && <Badge className="font-mono text-[9px] uppercase bg-primary/20 text-primary border-primary/30">Popular</Badge>}
                    {isPaidCurrent && <Badge className="font-mono text-[9px] uppercase bg-primary/20 text-primary border-primary/30">Atual</Badge>}
                    {isTrial && currentPlan?.name === plan.name && <Badge className="font-mono text-[9px] uppercase bg-amber-500/20 text-amber-400 border-amber-500/30">Trial</Badge>}
                  </div>
                </div>

                <div>
                  {isFree ? (
                    <div className="font-mono text-3xl font-bold">Grátis</div>
                  ) : (
                    <div className="font-mono flex items-end gap-0.5">
                      <span className="text-sm text-muted-foreground mb-1">R$</span>
                      <span className="text-3xl font-bold tabular-nums">
                        {Math.floor(plan.price_cents / 100)}
                      </span>
                      <span className="text-xl font-bold tabular-nums mb-0.5">
                        ,{String(plan.price_cents % 100).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-muted-foreground mb-1">/mês</span>
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
                  disabled={isPaidCurrent || subscribing === plan.name}
                  className={cn(
                    "font-mono text-xs uppercase w-full",
                    isPaidCurrent && "opacity-50 cursor-not-allowed",
                  )}
                  variant={isPro ? "default" : "outline"}
                >
                  {btnLabel}
                  {subscribing === plan.name && (
                    <span className="ml-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                  )}
                </Button>

                {!isFree && !isPaidCurrent && (
                  <p className="text-[10px] text-muted-foreground text-center -mt-2">
                    Pagamento seguro via Mercado Pago
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Aviso se não tiver planos do banco */}
        {regularPlans.length === 0 && (
          <div className="terminal-card p-6 flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-mono text-xs">Não foi possível carregar os planos. Tente recarregar a página.</span>
          </div>
        )}

        {/* Plano Personalizado */}
        {personalizado && (
          <div className={cn(
            "terminal-card p-6 border-2 border-amber-500/60",
            currentPlan?.name === "Personalizado" && "ring-1 ring-amber-500/40"
          )}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <Infinity className="h-5 w-5" />
                  <span className="font-mono text-sm font-semibold">Personalizado</span>
                  {currentPlan?.name === "Personalizado" && (
                    <Badge className="font-mono text-[10px] uppercase bg-amber-500/20 text-amber-400 border-amber-500/30">
                      Ativo
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-xs text-muted-foreground mb-3">
                  Acesso ilimitado a todas as funcionalidades. Ativado por código exclusivo.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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

        {/* Info segurança */}
        <div className="terminal-card p-4 flex items-start gap-3">
          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="font-mono text-xs text-muted-foreground">
            <strong className="text-foreground">Pagamento 100% seguro.</strong>{" "}
            Seus dados de cartão nunca tocam no nosso sistema — o checkout é processado diretamente pelo Mercado Pago. Cancele quando quiser.
          </div>
        </div>

      </div>
    </div>
  );
}
