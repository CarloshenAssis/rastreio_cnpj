import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, Star, Rocket, Loader2 } from "lucide-react";
import { LogoFull } from "@/components/Logo";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const PLAN_INFO: Record<string, { label: string; price: string; icon: React.ReactNode }> = {
  Starter: { label: "Starter", price: "R$ 19,90/mês", icon: <Star className="h-4 w-4" /> },
  Pro:     { label: "Pro",     price: "R$ 44,90/mês", icon: <Rocket className="h-4 w-4" /> },
};

async function goToCheckout(planName: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("mp-create-preference", {
    body: { plan_name: planName },
  });
  if (error || data?.error) throw new Error(data?.error || error?.message || "Erro ao gerar link de pagamento.");
  if (!data?.init_point) throw new Error("Link de pagamento não recebido.");
  window.location.href = data.init_point;
}

export default function Login() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan"); // ex: "Starter" ou "Pro"
  const planInfo = planParam ? PLAN_INFO[planParam] : null;

  const [tab, setTab] = useState<string>(planParam ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se já logado e tem ?plan=, vai direto pro checkout
  useEffect(() => {
    if (!user) return;
    if (planParam && PLAN_INFO[planParam]) {
      setCheckingOut(true);
      goToCheckout(planParam)
        .catch((e) => {
          toast.error(e.message);
          setCheckingOut(false);
          nav("/planos", { replace: true });
        });
    } else {
      nav("/dashboard", { replace: true });
    }
  }, [user, planParam, nav]);

  const afterAuth = async () => {
    if (planParam && PLAN_INFO[planParam]) {
      setCheckingOut(true);
      try {
        await goToCheckout(planParam);
      } catch (e: any) {
        toast.error(e.message || "Erro ao abrir checkout. Vá em Planos para assinar.");
        nav("/planos", { replace: true });
      }
    } else {
      nav("/dashboard", { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    await afterAuth();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Informe seu nome completo."); return; }
    setError(null); setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName.trim(), company_name: companyName.trim() },
      },
    });
    if (error) { setLoading(false); setError(error.message); return; }
    if (data.session) {
      await afterAuth();
      return;
    }
    // Email não confirmado — tenta login direto mesmo assim
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginErr) {
      toast.success("Conta criada! Verifique seu email para confirmar e depois faça login.");
    } else {
      await afterAuth();
    }
  };

  if (checkingOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="font-mono text-sm text-muted-foreground">Abrindo checkout do Mercado Pago…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background terminal-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Voltar */}
        <div className="mb-6">
          <Link to="/" className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors w-fit">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao início
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <LogoFull iconClass="h-12 w-12" textClass="text-xl" />
        </div>

        {/* Banner do plano selecionado */}
        {planInfo && (
          <div className="terminal-card p-3 mb-4 flex items-center gap-3 border-primary/40 border-2 bg-primary/5">
            <div className="text-primary">{planInfo.icon}</div>
            <div>
              <p className="font-mono text-xs font-semibold text-primary">
                Plano {planInfo.label} — {planInfo.price}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Crie sua conta ou entre para ir ao checkout
              </p>
            </div>
          </div>
        )}

        <div className="terminal-card p-6 bg-card/80 backdrop-blur">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-mono text-xs uppercase">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="font-mono text-xs uppercase">Criar conta</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input id="email-login" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-login" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Senha</Label>
                  <Input id="pw-login" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono text-sm" />
                </div>
                {error && (
                  <div className="flex items-start gap-2 text-xs text-destructive font-mono">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase tracking-wider">
                  {loading
                    ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Conectando…</>
                    : planInfo ? `Entrar e ir para o checkout →` : "Entrar →"}
                </Button>
              </form>
            </TabsContent>

            {/* Cadastro */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-signup" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Nome completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name-signup" type="text" required
                    placeholder="João da Silva"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-signup" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Nome do escritório / empresa <span className="font-mono text-[9px] text-muted-foreground/50">(opcional)</span>
                  </Label>
                  <Input
                    id="company-signup" type="text"
                    placeholder="Silva Contabilidade"
                    value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email-signup" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-signup" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Senha (mín. 6 caracteres) <span className="text-destructive">*</span>
                  </Label>
                  <Input id="pw-signup" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono text-sm" />
                </div>
                {error && (
                  <div className="flex items-start gap-2 text-xs text-destructive font-mono">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase tracking-wider">
                  {loading
                    ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Criando conta…</>
                    : planInfo ? `Criar conta e assinar ${planInfo.label} →` : "Criar conta grátis →"}
                </Button>
                <p className="text-[10px] text-muted-foreground font-mono text-center">
                  {planInfo
                    ? `Você será levado para o checkout seguro do Mercado Pago`
                    : "7 dias grátis · Sem cartão de crédito"}
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          dados fiscais brasileiros · tempo real · seguro
        </div>
      </div>
    </div>
  );
}
