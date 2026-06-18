import { Link } from "react-router-dom";
import {
  TerminalSquare, ArrowRight, Check, X, Search, Activity, Bell,
  FileText, TrendingUp, Shield, BarChart2, Upload, Clock,
  CheckCircle2, AlertTriangle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ─── dados estáticos ───────────────────────────────────────────────────────

const MONITORED = [
  "Situação cadastral",
  "Simples Nacional",
  "Regime tributário",
  "Alterações de sócios",
  "Alterações cadastrais",
  "CNAEs",
  "Endereço",
  "Histórico completo de mudanças",
];

const FEATURES = [
  {
    icon: Search,
    title: "Consulta em lote",
    desc: "Cole centenas de CNPJs de uma vez e consulte todos simultaneamente. Sem abrir a Receita um por um.",
  },
  {
    icon: Upload,
    title: "Upload por Excel",
    desc: "Importe planilhas .xlsx ou .csv em segundos. O sistema detecta automaticamente a coluna de CNPJ.",
  },
  {
    icon: BarChart2,
    title: "Dashboard inteligente",
    desc: "Veja empresas ativas, baixadas, optantes do Simples, alterações do mês e indicadores da carteira.",
  },
  {
    icon: TrendingUp,
    title: "Histórico completo",
    desc: "Saiba exatamente o que mudou, quando mudou e qual era o valor anterior — com trilha de auditoria.",
  },
  {
    icon: FileText,
    title: "PDFs profissionais",
    desc: "Gere relatórios completos com QSA, CNAEs, endereço e histórico para seus clientes em um clique.",
  },
  {
    icon: Bell,
    title: "Sistema de alertas",
    desc: "Receba notificações sempre que qualquer empresa sofrer alteração fiscal, cadastral ou tributária.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Cadastre ou importe os CNPJs da sua carteira",
    desc: "Cole uma lista, suba um Excel ou adicione um por um. Leva menos de 2 minutos.",
  },
  {
    n: "2",
    title: "O sistema consulta diretamente a Receita Federal",
    desc: "Usando BrasilAPI + ReceitaWS como redundância. Dados sempre atualizados.",
  },
  {
    n: "3",
    title: "Os dados ficam armazenados com histórico completo",
    desc: "Cada alteração detectada fica registrada com data, hora, valor anterior e novo valor.",
  },
  {
    n: "4",
    title: "Você é avisado sempre que algo mudar",
    desc: "Você deixa de procurar problemas. O sistema encontra eles para você.",
  },
];

const BEFORE = [
  "Conferência manual empresa por empresa",
  "Planilhas desatualizadas e fora de controle",
  "Horas perdidas em tarefas operacionais",
  "Sem histórico de mudanças",
  "Sem alertas — você descobre tarde",
  "Alto risco de esquecer clientes",
];

const AFTER = [
  "Monitoramento automático de toda a carteira",
  "Alertas em tempo real quando algo muda",
  "Histórico auditável de cada alteração",
  "Dashboard com visão completa da carteira",
  "Relatórios profissionais em 1 clique",
  "Muito mais produtividade e segurança",
];

const FOR_WHO = [
  "Escritórios de contabilidade",
  "Contadores autônomos",
  "BPO Financeiro",
  "Consultorias tributárias",
  "Empresas que administram muitos CNPJs",
];

const STARTER_FEATURES = [
  "100 consultas/mês",
  "50 empresas monitoradas",
  "50 relatórios PDF/mês",
  "10 exports CSV/XLSX/mês",
  "Alertas por e-mail",
  "Tags e favoritos",
  "Monitoramento mensal e quinzenal",
  "7 dias grátis inclusos",
];

const PRO_FEATURES = [
  "2.000 consultas/mês",
  "500 empresas monitoradas",
  "100 relatórios PDF/mês",
  "50 exports CSV/XLSX/mês",
  "Alertas por e-mail",
  "Tags e favoritos",
  "Monitoramento diário, semanal, quinzenal e mensal",
  "Monitora regime, status, endereço e sócios",
  "7 dias grátis inclusos",
];

const INCLUDE = [
  "Dashboard",
  "Consulta individual",
  "Consulta em lote",
  "Monitoramento automático",
  "Histórico de alterações",
  "Exportação Excel",
  "Exportação PDF",
  "Sistema de alertas",
  "Dashboard estatístico",
  "Atualizações futuras",
];

const TRUST = [
  "Dados oficiais da Receita Federal",
  "BrasilAPI como fonte primária",
  "ReceitaWS como redundância automática",
  "Cache inteligente de 24h",
  "Histórico auditável de alterações",
  "Banco de dados com Row Level Security",
  "Infraestrutura em nuvem (Supabase + Vercel)",
];

const FAQS = [
  {
    q: "Como funciona o teste gratuito?",
    a: "Você recebe 7 dias completos de acesso ao plano Starter sem precisar cadastrar cartão de crédito. Após o período, pode assinar ou continuar com o plano gratuito limitado.",
  },
  {
    q: "Posso importar minha planilha de clientes?",
    a: "Sim. O sistema aceita arquivos Excel (.xlsx, .xls) e CSV. Ele detecta automaticamente a coluna com os CNPJs e exibe uma prévia antes de confirmar.",
  },
  {
    q: "Posso consultar vários CNPJs ao mesmo tempo?",
    a: "Sim. O sistema processa lotes de até centenas de CNPJs de uma vez, atualizando os resultados em tempo real enquanto processa.",
  },
  {
    q: "Recebo alertas automáticos?",
    a: "Sim. Sempre que o sistema detectar uma alteração em qualquer empresa monitorada, você recebe um alerta na central de notificações. Alertas por e-mail estão disponíveis nos planos Starter e Pro.",
  },
  {
    q: "Os dados vêm da Receita Federal?",
    a: "Sim. Os dados são obtidos via BrasilAPI e ReceitaWS, que consultam diretamente as fontes oficiais da Receita Federal do Brasil.",
  },
  {
    q: "Funciona para qualquer escritório?",
    a: "Sim. De pequenos escritórios com poucos clientes até operações com centenas de empresas. O plano Starter resolve a maioria dos casos; o Pro é para grandes volumes.",
  },
  {
    q: "Preciso instalar algum programa?",
    a: "Não. Todo o sistema funciona pelo navegador. Basta criar sua conta e começar.",
  },
  {
    q: "É seguro?",
    a: "Sim. Cada usuário vê apenas seus próprios dados. O sistema usa autenticação robusta, controle de acesso por linha (RLS), CORS restrito e headers de segurança HTTP.",
  },
];

// ─── componente FAQ ─────────────────────────────────────────────────────────

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-mono text-sm font-medium text-foreground">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ─── página ─────────────────────────────────────────────────────────────────

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">

      {/* ── HEADER ── */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">CNPJTrack</span>
          <span className="hidden sm:block text-[10px] text-muted-foreground uppercase tracking-widest ml-1">monitoramento fiscal</span>
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

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Para contadores e escritórios de contabilidade
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Pare de perder horas<br />
          <span className="text-primary">verificando CNPJs</span><br />
          manualmente.
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
          Monitore toda a carteira dos seus clientes automaticamente e seja avisado sempre que houver qualquer alteração fiscal, cadastral ou tributária.
        </p>

        <p className="text-muted-foreground/70 text-sm mb-10">
          Sem consultar empresa por empresa. Sem planilhas. Sem esquecer nenhum cliente.
        </p>

        <Link to="/login">
          <Button size="lg" className="font-mono text-sm uppercase px-10 bg-primary hover:bg-primary-glow shadow-lg shadow-primary/20">
            Quero testar gratuitamente por 7 dias <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
        <p className="text-muted-foreground/60 text-xs mt-4">
          Sem cartão de crédito · Acesso imediato
        </p>
      </section>

      {/* ── IDENTIFICAÇÃO ── */}
      <section className="bg-background-deep/40 border-y border-border/50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 text-center">Você se identifica?</div>
          <h2 className="text-2xl font-bold text-center mb-10">
            Se hoje você administra dezenas ou centenas de CNPJs...
          </h2>

          <div className="terminal-card p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-4">Provavelmente sua rotina é parecida com esta:</p>
            <ul className="space-y-3">
              {[
                "Abrir o site da Receita Federal inúmeras vezes",
                "Consultar cliente por cliente, manualmente",
                "Copiar informações para planilhas desatualizadas",
                "Descobrir mudanças somente quando o problema já aconteceu",
                "Perder horas em tarefas repetitivas que não geram valor",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">Enquanto isso...</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: AlertTriangle, label: "Uma alteração no Simples Nacional", color: "text-warning" },
                { icon: AlertTriangle, label: "Uma mudança de regime tributário", color: "text-warning" },
                { icon: AlertTriangle, label: "Uma empresa baixada ou inapta", color: "text-destructive" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="terminal-card p-4 flex flex-col items-center gap-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <p className="text-xs text-muted-foreground text-center">{label}</p>
                  <p className="text-[10px] text-muted-foreground/60 text-center">pode passar despercebida e gerar prejuízo</p>
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-foreground pt-2">
              Foi exatamente para eliminar esse trabalho que nasceu o CNPJTrack.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Como funciona</div>
            <h2 className="text-2xl font-bold mb-3">
              O CNPJTrack transforma horas de conferência manual em poucos segundos.
            </h2>
            <p className="text-muted-foreground text-sm">Basta:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="terminal-card p-6 flex gap-4">
                <div className="flex-shrink-0 h-9 w-9 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center font-mono text-primary font-bold text-lg">
                  {n}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 terminal-card p-5 text-center border-primary/30 border-2">
            <p className="text-sm font-semibold text-primary">
              Você deixa de procurar problemas.
            </p>
            <p className="text-muted-foreground text-sm mt-1">O sistema encontra eles para você.</p>
          </div>
        </div>
      </section>

      {/* ── O QUE MONITORA ── */}
      <section className="bg-background-deep/40 border-y border-border/50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Cobertura completa</div>
            <h2 className="text-2xl font-bold">O que o sistema monitora automaticamente</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MONITORED.map((item) => (
              <div key={item} className="terminal-card p-3.5 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Tudo organizado em um único painel. Histórico auditável de cada alteração detectada.
          </p>
        </div>
      </section>

      {/* ── ANTES X DEPOIS ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Transformação</div>
            <h2 className="text-2xl font-bold">Antes x Depois do CNPJTrack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="terminal-card p-6 border-destructive/30 border-2">
              <div className="flex items-center gap-2 mb-5">
                <X className="h-4 w-4 text-destructive" />
                <span className="font-mono text-[10px] text-destructive uppercase tracking-widest font-bold">Antes do CNPJTrack</span>
              </div>
              <ul className="space-y-3">
                {BEFORE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="terminal-card p-6 border-primary/40 border-2">
              <div className="flex items-center gap-2 mb-5">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-bold">Depois do CNPJTrack</span>
              </div>
              <ul className="space-y-3">
                {AFTER.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section className="bg-background-deep/40 border-y border-border/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Funcionalidades</div>
            <h2 className="text-2xl font-bold">Tudo que um contador precisa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="terminal-card p-5 space-y-3 hover:border-primary/40 transition-colors">
                <div className="h-9 w-9 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM ── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Público-alvo</div>
          <h2 className="text-2xl font-bold mb-8">Para quem é o CNPJTrack?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {FOR_WHO.map((item) => (
              <div key={item} className="terminal-card px-5 py-3 flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O QUE VOCÊ RECEBE ── */}
      <section className="bg-background-deep/40 border-y border-border/50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Oferta</div>
            <h2 className="text-2xl font-bold">Você recebe acesso a tudo isso</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCLUDE.map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-sm hover:bg-muted/20">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Planos</div>
            <h2 className="text-2xl font-bold">Escolha o plano ideal para o seu escritório</h2>
            <p className="text-muted-foreground text-sm mt-2">7 dias grátis em qualquer plano · Sem cartão de crédito · Cancele quando quiser</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="terminal-card p-7 flex flex-col gap-5 border-2 border-primary/40">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Para escritórios em crescimento</div>
                <div className="text-lg font-bold">Starter</div>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-xs text-muted-foreground">R$</span>
                <span className="text-4xl font-bold tabular-nums">19</span>
                <span className="text-xl font-bold tabular-nums">,90</span>
                <span className="text-sm text-muted-foreground mb-1">/mês</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {STARTER_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login">
                <Button variant="outline" className="w-full font-mono text-xs uppercase">
                  Começar trial grátis <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="terminal-card p-7 flex flex-col gap-5 border-2 border-primary ring-1 ring-primary/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
                Mais popular
              </div>
              <div>
                <div className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">Para grandes carteiras</div>
                <div className="text-lg font-bold">Pro</div>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-xs text-muted-foreground">R$</span>
                <span className="text-4xl font-bold tabular-nums">44</span>
                <span className="text-xl font-bold tabular-nums">,90</span>
                <span className="text-sm text-muted-foreground mb-1">/mês</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login">
                <Button className="w-full font-mono text-xs uppercase bg-primary hover:bg-primary-glow">
                  Começar trial grátis <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Precisa de volume maior?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Fale sobre o plano Personalizado →
            </Link>
          </p>
        </div>
      </section>

      {/* ── POR QUE CONFIAR ── */}
      <section className="bg-background-deep/40 border-y border-border/50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Confiabilidade</div>
            <h2 className="text-2xl font-bold">Por que confiar no CNPJTrack?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRUST.map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-sm">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTIA ── */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="terminal-card p-8 text-center border-2 border-primary/30">
            <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Experimente gratuitamente durante 7 dias.</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              Sem cartão de crédito. Conheça todas as funcionalidades e veja como sua rotina pode mudar antes mesmo de decidir assinar.
            </p>
            <p className="text-muted-foreground/70 text-xs">
              Acesso imediato ao plano Starter completo logo após o cadastro.
            </p>
          </div>
        </div>
      </section>

      {/* ── OBJEÇÕES ── */}
      <section className="bg-background-deep/40 border-y border-border/50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Dúvidas frequentes</div>
            <h2 className="text-2xl font-bold">Perguntas e Respostas</h2>
          </div>
          <div className="terminal-card px-6 divide-y divide-border/50">
            {FAQS.map(({ q, a }) => (
              <FAQ key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Pronto para começar?</div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Pare de desperdiçar horas fazendo conferências manuais.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2 max-w-xl mx-auto">
            Deixe que o CNPJTrack monitore toda a sua carteira automaticamente enquanto você foca no que realmente gera valor para seus clientes.
          </p>
          <p className="text-muted-foreground/60 text-xs mb-10">
            De contador que passa horas conferindo CNPJs manualmente para um escritório que monitora centenas de empresas automaticamente e é avisado apenas quando algo realmente muda.
          </p>
          <Link to="/login">
            <Button size="lg" className="font-mono text-sm uppercase px-10 bg-primary hover:bg-primary-glow shadow-lg shadow-primary/20">
              Quero começar meu teste gratuito agora <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="text-muted-foreground/60 text-xs mt-4">
            Sem cartão de crédito · Acesso imediato · 7 dias grátis
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <TerminalSquare className="h-3.5 w-3.5 text-primary" />
          CNPJTrack © {new Date().getFullYear()} · Monitoramento fiscal para contadores
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Entrar na plataforma
          </Link>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Criar conta grátis
          </Link>
        </div>
      </footer>

    </div>
  );
}
