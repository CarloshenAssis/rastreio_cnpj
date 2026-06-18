import { Link } from "react-router-dom";
import { TerminalSquare, Search, Activity, Bell, FileText, Shield, ArrowRight, Check, Zap, Star, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Search, title: "Consulta de CNPJ", desc: "Busque qualquer CNPJ e veja regime tributário, status cadastral, porte e muito mais em segundos." },
  { icon: Activity, title: "Monitoramento automático", desc: "Defina frequência e seja avisado quando algo mudar: regime, status, sócios, endereço." },
  { icon: Bell, title: "Alertas em tempo real", desc: "Receba alertas no app e por e-mail sempre que houver alteração nos seus CNPJs monitorados." },
  { icon: FileText, title: "Relatórios PDF e Exportação", desc: "Gere relatórios PDF individuais ou em lote e exporte para CSV ou XLSX com um clique." },
  { icon: Shield, title: "Segurança e privacidade", desc: "Seus dados ficam isolados por usuário com Row Level Security. Nunca compartilhamos informações." },
  { icon: TerminalSquare, title: "API de dados em tempo real", desc: "Dados atualizados via BrasilAPI com cache inteligente de 24h para consultas ágeis." },
];

const PLANS = [
  { name: "Trial 7 dias", price: "Grátis", features: ["100 CNPJs/mês", "50 monitorados", "50 PDFs/mês", "10 exports/mês", "Alertas por e-mail"], icon: Zap, color: "border-border", trial: true },
  { name: "Starter", price: "R$ 19,90/mês", features: ["100 CNPJs/mês", "50 monitorados", "50 PDFs/mês", "10 exports/mês", "Alertas por e-mail"], icon: Star, color: "border-primary/60" },
  { name: "Pro", price: "R$ 44,90/mês", features: ["2.000 CNPJs/mês", "500 monitorados", "100 PDFs/mês", "50 exports/mês", "Monitoramento diário"], icon: Rocket, color: "border-primary", highlight: true },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">CNPJTrack</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">terminal fiscal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-mono text-xs">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="font-mono text-xs uppercase bg-primary hover:bg-primary-glow">
              Começar grátis <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[11px] uppercase tracking-widest mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Monitoramento fiscal automatizado
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Rastreie CNPJs.<br />
          <span className="text-primary">Antecipe mudanças.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Consulte, monitore e receba alertas sobre regime tributário, status cadastral, sócios e endereço de qualquer CNPJ brasileiro. Tudo em um painel simples e rápido.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="font-mono text-sm uppercase px-8 bg-primary hover:bg-primary-glow">
              Criar conta grátis <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="font-mono text-sm uppercase px-8">
              Já tenho conta
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-xs mt-6">Sem cartão de crédito. Plano grátis para sempre.</p>
      </section>

      {/* Features */}
      <section className="bg-background-deep/30 border-y border-border/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Funcionalidades</div>
            <h2 className="text-2xl font-bold">Tudo que você precisa para monitorar CNPJs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="terminal-card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-sm bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm font-semibold">{title}</div>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Preços</div>
            <h2 className="text-2xl font-bold">7 dias grátis, depois escolha seu plano</h2>
            <p className="text-muted-foreground text-sm mt-2">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, features, icon: Icon, color, highlight, trial }: any) => (
              <div
                key={name}
                className={`terminal-card p-6 flex flex-col gap-4 border-2 ${color} ${highlight ? "ring-1 ring-primary/40 scale-[1.02]" : ""}`}
              >
                {highlight && (
                  <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Mais popular</div>
                )}
                {trial && (
                  <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">7 dias grátis</div>
                )}
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{name}</span>
                </div>
                <div className="text-2xl font-bold">{price}</div>
                <ul className="space-y-2 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button
                    className="w-full font-mono text-xs uppercase"
                    variant={highlight ? "default" : "outline"}
                  >
                    {trial ? "Começar trial grátis" : "Assinar"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Precisa de mais? Temos o plano <strong>Personalizado</strong> com limites ilimitados e suporte prioritário.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary/5 border-t border-primary/20 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Comece a monitorar agora</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Configure sua conta em menos de 1 minuto. Plano gratuito disponível, sem cartão de crédito.
          </p>
          <Link to="/login">
            <Button size="lg" className="font-mono text-sm uppercase px-10 bg-primary hover:bg-primary-glow">
              Criar conta grátis <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <TerminalSquare className="h-3.5 w-3.5 text-primary" />
          CNPJTrack © {new Date().getFullYear()}
        </div>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Entrar na plataforma
        </Link>
      </footer>
    </div>
  );
}
