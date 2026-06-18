import { Link } from "react-router-dom";
import {
  TerminalSquare, Search, Activity, Bell, FileText, Shield,
  ArrowRight, Check, Zap, Star, Rocket, Clock, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Search,
    title: "Consulta instantânea de CNPJ",
    desc: "Busque qualquer CNPJ e veja regime tributário, status cadastral, porte, sócios e endereço em segundos. Dados sempre atualizados via Receita Federal.",
  },
  {
    icon: Activity,
    title: "Monitoramento automático",
    desc: "Cadastre os CNPJs dos seus clientes uma vez. O sistema verifica automaticamente e avisa quando qualquer dado mudar.",
  },
  {
    icon: Bell,
    title: "Alertas por e-mail",
    desc: "Receba alertas sempre que houver alteração em regime, status cadastral, sócios ou endereço — sem precisar verificar manualmente.",
  },
  {
    icon: FileText,
    title: "Relatórios PDF e exportação",
    desc: "Gere relatórios em PDF individuais ou em lote. Exporte para CSV ou XLSX para usar em seus sistemas.",
  },
  {
    icon: TrendingUp,
    title: "Histórico de alterações",
    desc: "Acesse o histórico completo de mudanças por CNPJ. Saiba exatamente quando e o que mudou no cadastro do seu cliente.",
  },
  {
    icon: Shield,
    title: "Segurança e isolamento de dados",
    desc: "Cada usuário vê apenas seus próprios dados. Sem compartilhamento, sem vazamento. Infraestrutura com criptografia e RLS.",
  },
];

const STEPS = [
  { n: "01", title: "Crie sua conta", desc: "7 dias grátis, sem cartão de crédito." },
  { n: "02", title: "Importe seus CNPJs", desc: "Cole uma lista ou suba um arquivo CSV com os CNPJs dos clientes." },
  { n: "03", title: "Defina a frequência", desc: "Escolha quando verificar: diário, semanal, quinzenal ou mensal." },
  { n: "04", title: "Receba os alertas", desc: "Quando algo mudar, você é avisado por e-mail automaticamente." },
];

const PLANS = [
  {
    name: "Starter",
    price: "R$ 19,90",
    per: "/mês",
    desc: "Para contadores e escritórios com carteira pequena.",
    features: [
      "100 CNPJs consultados/mês",
      "50 empresas monitoradas",
      "50 relatórios PDF/mês",
      "10 exports CSV/XLSX/PDF por mês",
      "Alertas por e-mail",
      "Tags e favoritos",
      "Monitoramento mensal/quinzenal",
    ],
    icon: Star,
    color: "border-primary/60",
    cta: "Começar trial grátis",
  },
  {
    name: "Pro",
    price: "R$ 44,90",
    per: "/mês",
    desc: "Para escritórios com grande volume de clientes.",
    features: [
      "2.000 CNPJs consultados/mês",
      "500 empresas monitoradas",
      "100 relatórios PDF/mês",
      "50 exports CSV/XLSX/PDF por mês",
      "Alertas por e-mail",
      "Tags e favoritos",
      "Monitoramento diário/semanal/quinzenal/mensal",
      "Monitora regime, status, endereço e sócios",
    ],
    icon: Rocket,
    color: "border-primary",
    highlight: true,
    cta: "Começar trial grátis",
  },
];

const TESTIMONIALS = [
  {
    text: "Antes eu verificava CNPJ por CNPJ no site da Receita. Agora o sistema me avisa quando algo muda. Economizo horas por semana.",
    author: "Escritório de contabilidade, SP",
  },
  {
    text: "Ideal para monitorar a carteira de clientes. Quando um cliente muda de regime ou fica inapto, recebo o alerta antes que vire problema.",
    author: "Contador autônomo, MG",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">CNPJTrack</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block ml-1">monitoramento fiscal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-mono text-xs">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="font-mono text-xs uppercase bg-primary hover:bg-primary-glow">
              7 dias grátis <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[11px] uppercase tracking-widest mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Para contadores e escritórios contábeis
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Pare de verificar CNPJ<br />
          <span className="text-primary">manualmente.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Monitore toda a sua carteira de clientes em um só lugar. Receba alertas automáticos quando regime tributário, status cadastral, sócios ou endereço mudarem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="font-mono text-sm uppercase px-8 bg-primary hover:bg-primary-glow">
              Começar 7 dias grátis <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="font-mono text-sm uppercase px-8">
              Já tenho conta
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-xs mt-4">
          Sem cartão de crédito · 7 dias grátis · Cancele quando quiser
        </p>
      </section>

      {/* Problema / Solução */}
      <section className="bg-background-deep/30 border-y border-border/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">O problema</div>
              <h2 className="text-xl font-bold mb-4">Verificar CNPJ na Receita é trabalhoso e manual</h2>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {[
                  "Você precisa entrar no site um a um",
                  "Não tem como saber se mudou desde a última vez",
                  "Cliente muda de regime e você fica sabendo tarde",
                  "CNPJ inapto vira problema fiscal inesperado",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">A solução</div>
              <h2 className="text-xl font-bold mb-4">CNPJTrack monitora sua carteira inteira automaticamente</h2>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {[
                  "Cadastre todos os CNPJs de uma vez",
                  "Sistema verifica e detecta alterações automaticamente",
                  "Você recebe alerta por e-mail quando algo mudar",
                  "Histórico completo de todas as alterações",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Como funciona</div>
            <h2 className="text-2xl font-bold">Configure em minutos, economize horas por semana</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="terminal-card p-5 space-y-3">
                <div className="font-mono text-3xl font-bold text-primary/30">{n}</div>
                <div className="text-sm font-semibold">{title}</div>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background-deep/30 border-y border-border/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Funcionalidades</div>
            <h2 className="text-2xl font-bold">Tudo que um contador precisa</h2>
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
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Planos</div>
            <h2 className="text-2xl font-bold">7 dias grátis em qualquer plano</h2>
            <p className="text-muted-foreground text-sm mt-2">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PLANS.map(({ name, price, per, desc, features, icon: Icon, color, highlight, cta }) => (
              <div
                key={name}
                className={`terminal-card p-6 flex flex-col gap-4 border-2 ${color} ${highlight ? "ring-1 ring-primary/40" : ""}`}
              >
                {highlight && (
                  <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Mais popular</div>
                )}
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-3xl font-bold tabular-nums">{price.replace("R$ ", "")}</span>
                  <span className="text-sm text-muted-foreground">{per}</span>
                </div>
                <p className="text-muted-foreground text-xs">{desc}</p>
                <ul className="space-y-2 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button className="w-full font-mono text-xs uppercase" variant={highlight ? "default" : "outline"}>
                    {cta} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Precisa de mais? O plano <strong>Personalizado</strong> oferece limites ilimitados e suporte prioritário.{" "}
            <Link to="/login" className="text-primary hover:underline">Entre em contato.</Link>
          </p>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-background-deep/30 border-y border-border/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Depoimentos</div>
            <h2 className="text-xl font-bold">O que dizem os contadores que usam</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ text, author }) => (
              <div key={author} className="terminal-card p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[11px] text-muted-foreground">{author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Quanto tempo você gasta verificando CNPJ por mês?
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Com CNPJTrack, você automatiza esse processo e recebe alertas quando algo mudar. Teste por 7 dias grátis.
          </p>
          <Link to="/login">
            <Button size="lg" className="font-mono text-sm uppercase px-10 bg-primary hover:bg-primary-glow">
              Começar 7 dias grátis <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-xs mt-4">Sem cartão · Cancele quando quiser</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <TerminalSquare className="h-3.5 w-3.5 text-primary" />
          CNPJTrack © {new Date().getFullYear()} · Monitoramento fiscal para contadores
        </div>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Entrar na plataforma
        </Link>
      </footer>
    </div>
  );
}
