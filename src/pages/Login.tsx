import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TerminalSquare, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Login() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (user) nav("/dashboard", { replace: true }); }, [user, nav]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    nav("/dashboard", { replace: true });
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
      nav("/dashboard", { replace: true });
      return;
    }
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginErr) {
      toast.success("Conta criada! Verifique seu email para confirmar e depois faça login.");
    } else {
      nav("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background terminal-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Voltar para landing */}
        <div className="mb-6">
          <Link to="/" className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors w-fit">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao início
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-8 justify-center">
          <TerminalSquare className="h-7 w-7 text-primary" />
          <div>
            <div className="font-mono text-xl font-semibold">CNPJTrack</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              terminal de monitoramento fiscal
            </div>
          </div>
        </div>

        <div className="terminal-card p-6 bg-card/80 backdrop-blur">
          <Tabs defaultValue="login" className="w-full">
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
                  {loading ? "Conectando..." : "Entrar →"}
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
                    id="name-signup"
                    type="text"
                    required
                    placeholder="João da Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-signup" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Nome do escritório / empresa <span className="font-mono text-[9px] text-muted-foreground/50">(opcional)</span>
                  </Label>
                  <Input
                    id="company-signup"
                    type="text"
                    placeholder="Silva Contabilidade"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
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
                  {loading ? "Criando..." : "Criar conta grátis →"}
                </Button>
                <p className="text-[10px] text-muted-foreground font-mono text-center">
                  7 dias grátis · Sem cartão de crédito
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
