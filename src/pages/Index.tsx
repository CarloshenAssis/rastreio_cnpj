import { Link } from "react-router-dom";
import {
  ArrowRight, Check, X, Search, Activity, Bell,
  FileText, TrendingUp, Shield, BarChart2, Upload, Clock,
  CheckCircle2, AlertTriangle, ChevronDown, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Logo, LogoFull } from "@/components/Logo";

// ─── hooks ──────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, inView: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

const TERMINAL_LINES = [
  { text: '$ cnpj-track --monitor carteira.xlsx', color: '#6366F1', delay: 0 },
  { text: '✓ 247 CNPJs carregados', color: '#10B981', delay: 600 },
  { text: '⚡ Consultando Receita Federal...', color: '#94a3b8', delay: 1200 },
  { text: '⚠  3 alterações detectadas', color: '#F59E0B', delay: 1800 },
  { text: '  → EMPRESA XYZ: Simples Nacional alterado', color: '#F87171', delay: 2200 },
  { text: '  → FULANO LTDA: Sócio adicionado', color: '#F87171', delay: 2600 },
  { text: '✓ Alertas enviados por e-mail', color: '#10B981', delay: 3000 },
  { text: '▋', color: '#6366F1', delay: 3400 },
];

function useTerminalLines() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    function startSequence() {
      setVisibleLines([]);
      TERMINAL_LINES.forEach((line, i) => {
        const t = setTimeout(() => {
          setVisibleLines(prev => [...prev, i]);
        }, line.delay);
        timers.push(t);
      });
      const loopTimer = setTimeout(() => {
        startSequence();
      }, 5000);
      timers.push(loopTimer);
    }
    startSequence();
    return () => timers.forEach(clearTimeout);
  }, []);
  return visibleLines;
}

// ─── dados estáticos ──────────────────────────────────────────────────────────

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

// ─── FAQ component ────────────────────────────────────────────────────────────

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-mono text-sm font-medium" style={{ color: 'rgba(226,232,240,0.9)' }}>{q}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-300"
          style={{ color: '#6366F1', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)' }}>{a}</p>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ value, suffix, label, inView }: { value: number; suffix: string; label: string; inView: boolean }) {
  const count = useCounter(value, inView);
  return (
    <div className="text-center px-6 py-4">
      <div className="text-4xl font-bold font-mono mb-1" style={{
        background: 'linear-gradient(to right, #6366F1, #10B981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {count}{suffix}
      </div>
      <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</div>
    </div>
  );
}

// ─── página ──────────────────────────────────────────────────────────────────

export default function Index() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const terminalLines = useTerminalLines();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const statsSection = useInView(0.2);
  const painSection = useInView();
  const howSection = useInView();
  const monitorSection = useInView();
  const beforeAfterSection = useInView();
  const featuresSection = useInView();
  const forWhoSection = useInView();
  const plansSection = useInView();
  const trustSection = useInView();
  const guaranteeSection = useInView();
  const faqSection = useInView();
  const ctaSection = useInView();

  const revealStyle = (inView: boolean): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(32px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  });

  return (
    <div
      className="min-h-screen font-mono"
      style={{ background: '#030712', color: '#e2e8f0' }}
    >
      <style>{`
        @keyframes gradient-move {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(5%, -5%) scale(1.05); }
          66% { transform: translate(-3%, 3%) scale(0.98); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes type-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2); }
        }
        @keyframes scan-line {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero-badge-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        .glow-btn {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }
        .float-card {
          animation: float 4s ease-in-out infinite;
        }
        .orb-1 {
          animation: gradient-move 8s ease-in-out infinite;
        }
        .orb-2 {
          animation: gradient-move 12s ease-in-out infinite reverse;
        }
        .orb-3 {
          animation: gradient-move 10s ease-in-out infinite 2s;
        }
        .terminal-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(99,102,241,0.4), transparent);
          animation: scan-line 3s linear infinite;
          pointer-events: none;
        }
        .hero-fade-up {
          animation: fade-in-up 0.8s ease forwards;
        }
        .hero-fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .hero-fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .hero-fade-up-3 { animation-delay: 0.4s; opacity: 0; }
        .hero-fade-up-4 { animation-delay: 0.55s; opacity: 0; }
        .hero-fade-up-5 { animation-delay: 0.7s; opacity: 0; }
        .hero-fade-up-6 { animation-delay: 0.85s; opacity: 0; }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        .gradient-text {
          background: linear-gradient(to right, #818cf8, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .feature-card:hover {
          border-color: rgba(99,102,241,0.3) !important;
          box-shadow: 0 0 30px rgba(99,102,241,0.15);
        }
        .monitor-item:hover {
          border-color: rgba(99,102,241,0.5) !important;
          background: rgba(99,102,241,0.05) !important;
        }
        .for-who-tag:hover {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 20px rgba(99,102,241,0.2);
        }
        .grid-bg {
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(3,7,18,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <LogoFull iconClass="h-8 w-8" textClass="text-sm" />
          <span
            className="hidden lg:block text-[10px] uppercase tracking-widest"
            style={{ color: 'rgba(148,163,184,0.5)' }}
          >
            monitoramento fiscal
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {['Funcionalidades', 'Planos', 'FAQ'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs uppercase tracking-widest transition-colors duration-200"
              style={{ color: 'rgba(148,163,184,0.7)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#e2e8f0')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.7)')}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ color: 'rgba(148,163,184,0.7)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.7)';
            }}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login">
            <button
              className="hidden sm:inline-flex px-4 py-2 text-xs uppercase tracking-widest rounded-lg transition-all duration-200 font-mono"
              style={{ color: 'rgba(148,163,184,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.8)';
              }}
            >
              Entrar
            </button>
          </Link>
          <Link to="/login">
            <button
              className="glow-btn inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest rounded-lg font-mono font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#fff',
              }}
            >
              <span className="hidden sm:inline">Testar grátis</span>
              <span className="sm:hidden">Testar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
        style={{ paddingTop: '80px' }}
      >
        <div className="orb-1 absolute rounded-full pointer-events-none" style={{
          width: '600px', height: '600px',
          top: '-10%', left: '-10%',
          background: 'rgba(99,102,241,0.15)',
          filter: 'blur(80px)',
        }} />
        <div className="orb-2 absolute rounded-full pointer-events-none" style={{
          width: '500px', height: '500px',
          bottom: '-5%', right: '-5%',
          background: 'rgba(16,185,129,0.1)',
          filter: 'blur(80px)',
        }} />
        <div className="orb-3 absolute rounded-full pointer-events-none" style={{
          width: '400px', height: '400px',
          top: '40%', left: '40%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(139,92,246,0.08)',
          filter: 'blur(80px)',
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="hero-fade-up hero-fade-up-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 font-mono text-[10px] uppercase tracking-widest" style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8',
              }}>
                <span className="hero-badge-dot h-1.5 w-1.5 rounded-full" style={{ background: '#10B981' }} />
                Monitoramento em tempo real
              </div>

              <h1 className="hero-fade-up hero-fade-up-2 text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight mb-6" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                Pare de perder tempo<br />
                verificando{' '}
                <span className="gradient-text">CNPJs</span>{' '}
                manualmente.
              </h1>

              <p className="hero-fade-up hero-fade-up-3 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)' }}>
                Monitore toda a carteira dos seus clientes automaticamente e seja avisado sempre que houver qualquer alteração fiscal, cadastral ou tributária.
              </p>

              <p className="hero-fade-up hero-fade-up-4 text-sm mb-10 max-w-xl mx-auto lg:mx-0" style={{ color: 'rgba(148,163,184,0.6)' }}>
                Sem consultar empresa por empresa. Sem planilhas. Sem esquecer nenhum cliente.
              </p>

              <div className="hero-fade-up hero-fade-up-5 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link to="/login">
                  <button
                    className="glow-btn inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-mono text-sm font-semibold uppercase tracking-wider transition-all duration-300 w-full sm:w-auto"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff' }}
                  >
                    Testar 7 dias grátis <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-mono text-sm font-semibold uppercase tracking-wider transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(226,232,240,0.8)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#e2e8f0';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(226,232,240,0.8)';
                  }}
                >
                  Ver como funciona
                </a>
              </div>

              <p className="hero-fade-up hero-fade-up-6 text-xs font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
                Sem cartão · Acesso imediato · 247 contadores já usam
              </p>
            </div>

            {/* Terminal */}
            <div className="hero-fade-up hero-fade-up-5 float-card">
              <div className="glass-card overflow-hidden" style={{
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 25px 50px rgba(0,0,0,0.5)',
              }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="h-3 w-3 rounded-full" style={{ background: '#FF5F56' }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: '#27C93F' }} />
                  <span className="ml-3 text-xs font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    cnpj-track ~ terminal
                  </span>
                </div>
                <div className="relative p-6 min-h-[220px]" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <div className="terminal-scanline" />
                  <div className="space-y-1.5">
                    {TERMINAL_LINES.map((line, i) => (
                      terminalLines.includes(i) && (
                        <div
                          key={i}
                          className="text-sm font-mono leading-relaxed"
                          style={{ color: line.color, animation: 'fade-in-up 0.3s ease forwards' }}
                        >
                          {line.text}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsSection.ref} style={revealStyle(statsSection.inView)}>
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              <StatCard value={2000} suffix="+" label="CNPJs monitorados hoje" inView={statsSection.inView} />
              <StatCard value={247} suffix="" label="Contadores ativos" inView={statsSection.inView} />
              <StatCard value={98} suffix="%" label="Uptime garantido" inView={statsSection.inView} />
              <div className="text-center px-6 py-4">
                <div className="text-4xl font-bold font-mono mb-1" style={{
                  background: 'linear-gradient(to right, #6366F1, #10B981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  &lt; 2s
                </div>
                <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.7)' }}>tempo de consulta</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── PAIN POINTS ── */}
      <div ref={painSection.ref} style={revealStyle(painSection.inView)}>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Você se identifica?</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>
                Sua rotina hoje provavelmente é assim:
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                "Abrir o site da Receita Federal inúmeras vezes",
                "Consultar cliente por cliente, manualmente",
                "Copiar informações para planilhas desatualizadas",
                "Descobrir mudanças somente quando o problema já aconteceu",
                "Perder horas em tarefas repetitivas que não geram valor",
              ].map((item) => (
                <div key={item} className="glass-card p-5 flex items-start gap-3" style={{ borderLeft: '3px solid rgba(239,68,68,0.5)' }}>
                  <X className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#F87171' }} />
                  <span className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: '#f1f5f9' }}>
                Foi exatamente para eliminar isso que criamos o{' '}
                <span className="gradient-text">CNPJ Brasil Track.</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div ref={howSection.ref} style={revealStyle(howSection.inView)} id="como-funciona">
        <section className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Como funciona</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>
                De horas de conferência manual a{' '}
                <span className="gradient-text">poucos segundos</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="glass-card p-6">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-lg mb-4"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}>
                    {n}
                  </div>
                  <p className="font-semibold text-sm mb-2" style={{ color: '#f1f5f9' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 p-6 rounded-2xl text-center"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <p className="font-semibold text-base" style={{ color: '#818cf8' }}>Você deixa de procurar problemas.</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.7)' }}>O sistema encontra eles para você.</p>
            </div>
          </div>
        </section>
      </div>

      {/* ── WHAT IT MONITORS ── */}
      <div ref={monitorSection.ref} style={revealStyle(monitorSection.inView)}>
        <section className="py-20 px-4" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#10B981' }}>Cobertura completa</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>O que o sistema monitora automaticamente</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MONITORED.map((item) => (
                <div key={item} className="monitor-item glass-card p-4 flex items-center gap-3 cursor-default transition-all duration-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#10B981' }} />
                  <span className="text-sm" style={{ color: '#e2e8f0' }}>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-8 font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Tudo organizado em um único painel. Histórico auditável de cada alteração detectada.
            </p>
          </div>
        </section>
      </div>

      {/* ── BEFORE / AFTER ── */}
      <div ref={beforeAfterSection.ref} style={revealStyle(beforeAfterSection.inView)}>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Transformação</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>Antes x Depois do CNPJ Brasil Track</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-7" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-6">
                  <X className="h-4 w-4" style={{ color: '#F87171' }} />
                  <span className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: '#F87171' }}>Antes do CNPJ Brasil Track</span>
                </div>
                <ul className="space-y-3">
                  {BEFORE.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>
                      <X className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'rgba(239,68,68,0.6)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-7" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 mb-6">
                  <Check className="h-4 w-4" style={{ color: '#10B981' }} />
                  <span className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: '#10B981' }}>Depois do CNPJ Brasil Track</span>
                </div>
                <ul className="space-y-3">
                  {AFTER.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── FEATURES ── */}
      <div ref={featuresSection.ref} style={revealStyle(featuresSection.inView)} id="funcionalidades">
        <section className="py-20 px-4" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Funcionalidades</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>Tudo que um contador precisa</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="feature-card glass-card p-6 space-y-4 transition-all duration-300 cursor-default">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <Icon className="h-5 w-5" style={{ color: '#818cf8' }} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── FOR WHOM ── */}
      <div ref={forWhoSection.ref} style={revealStyle(forWhoSection.inView)}>
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Público-alvo</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-10" style={{ color: '#f1f5f9' }}>Para quem é o CNPJ Brasil Track?</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {FOR_WHO.map((item) => (
                <div key={item} className="for-who-tag glass-card px-5 py-3 flex items-center gap-2 text-sm font-mono transition-all duration-300 cursor-default" style={{ color: '#e2e8f0' }}>
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#10B981' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── PLANS ── */}
      <div ref={plansSection.ref} style={revealStyle(plansSection.inView)} id="planos">
        <section className="py-20 px-4" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Planos</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#f1f5f9' }}>Escolha o plano ideal para o seu escritório</h2>
              <p className="text-sm font-mono" style={{ color: 'rgba(148,163,184,0.6)' }}>7 dias grátis em qualquer plano · Sem cartão de crédito · Cancele quando quiser</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Starter */}
              <div className="glass-card p-8 flex flex-col gap-6" style={{ borderColor: 'rgba(99,102,241,0.4)' }}>
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-2 font-mono" style={{ color: 'rgba(148,163,184,0.6)' }}>Para escritórios em crescimento</div>
                  <div className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Starter</div>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>R$</span>
                  <span className="text-5xl font-bold tabular-nums" style={{ color: '#f1f5f9' }}>19</span>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: '#f1f5f9' }}>,90</span>
                  <span className="text-sm mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>/mês</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {STARTER_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs font-mono" style={{ color: 'rgba(148,163,184,0.8)' }}>
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#10B981' }} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="space-y-3">
                  <Link to="/login" className="block">
                    <button
                      className="w-full py-3 rounded-xl text-xs uppercase tracking-widest font-mono font-semibold transition-all duration-300"
                      style={{ border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      Testar gratuitamente →
                    </button>
                  </Link>
                  <Link to="/login?plan=Starter" className="block">
                    <button
                      className="w-full py-3 rounded-xl text-xs uppercase tracking-widest font-mono font-semibold transition-all duration-300"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.7)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      Assinar agora →
                    </button>
                  </Link>
                </div>
              </div>

              {/* Pro */}
              <div className="glass-card p-8 flex flex-col gap-6 relative" style={{ borderColor: '#6366F1', boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold font-mono"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff' }}>
                  Mais popular
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-2 font-mono" style={{ color: '#818cf8' }}>Para grandes carteiras</div>
                  <div className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Pro</div>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>R$</span>
                  <span className="text-5xl font-bold tabular-nums" style={{ color: '#f1f5f9' }}>44</span>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: '#f1f5f9' }}>,90</span>
                  <span className="text-sm mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>/mês</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs font-mono" style={{ color: 'rgba(148,163,184,0.8)' }}>
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#10B981' }} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="space-y-3">
                  <Link to="/login" className="block">
                    <button
                      className="glow-btn w-full py-3 rounded-xl text-xs uppercase tracking-widest font-mono font-semibold flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff' }}
                    >
                      Testar gratuitamente <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                  <Link to="/login?plan=Pro" className="block">
                    <button
                      className="w-full py-3 rounded-xl text-xs uppercase tracking-widest font-mono font-semibold transition-all duration-300"
                      style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      Assinar agora →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <p className="text-center text-xs font-mono mt-8" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Precisa de volume maior?{' '}
              <Link to="/login" style={{ color: '#818cf8' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#a5b4fc')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#818cf8')}>
                Fale sobre o plano Personalizado →
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* ── WHY TRUST ── */}
      <div ref={trustSection.ref} style={revealStyle(trustSection.inView)}>
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#10B981' }}>Confiabilidade</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>Por que confiar no CNPJ Brasil Track?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRUST.map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200" style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}>
                  <Shield className="h-4 w-4 shrink-0" style={{ color: '#10B981' }} />
                  <span className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── GUARANTEE ── */}
      <div ref={guaranteeSection.ref} style={revealStyle(guaranteeSection.inView)}>
        <section className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-10 text-center" style={{ borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 0 40px rgba(99,102,241,0.1)' }}>
              <div className="text-8xl font-black font-mono mb-4 gradient-text">7</div>
              <Clock className="h-8 w-8 mx-auto mb-4" style={{ color: '#6366F1' }} />
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#f1f5f9' }}>Experimente gratuitamente durante 7 dias.</h2>
              <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>
                Sem cartão de crédito. Conheça todas as funcionalidades e veja como sua rotina pode mudar antes mesmo de decidir assinar.
              </p>
              <p className="text-xs font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
                Acesso imediato ao plano Starter completo logo após o cadastro.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── FAQ ── */}
      <div ref={faqSection.ref} style={revealStyle(faqSection.inView)} id="faq">
        <section className="py-20 px-4" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase tracking-widest mb-3 font-mono" style={{ color: '#6366F1' }}>Dúvidas frequentes</div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f1f5f9' }}>Perguntas e Respostas</h2>
            </div>
            <div className="glass-card px-8 py-2">
              {FAQS.map(({ q, a }) => (
                <FAQ key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── CTA FINAL ── */}
      <div ref={ctaSection.ref} style={revealStyle(ctaSection.inView)}>
        <section className="py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="text-[10px] uppercase tracking-widest mb-6 font-mono" style={{ color: '#6366F1' }}>Pronto para começar?</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight" style={{ color: '#f1f5f9' }}>
              Pare de desperdiçar horas fazendo{' '}
              <span className="gradient-text">conferências manuais.</span>
            </h2>
            <p className="text-base leading-relaxed mb-3 max-w-xl mx-auto" style={{ color: 'rgba(148,163,184,0.8)' }}>
              Deixe que o CNPJ Brasil Track monitore toda a sua carteira automaticamente enquanto você foca no que realmente gera valor para seus clientes.
            </p>
            <p className="text-xs mb-12 max-w-xl mx-auto font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
              De contador que passa horas conferindo CNPJs manualmente para um escritório que monitora centenas de empresas automaticamente.
            </p>
            <Link to="/login">
              <button
                className="glow-btn inline-flex items-center gap-2 px-10 py-4 rounded-xl text-sm uppercase tracking-widest font-mono font-bold"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff' }}
              >
                Testar grátis agora <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {['Sem cartão de crédito', 'Acesso imediato', '7 dias grátis'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-mono" style={{ color: 'rgba(148,163,184,0.6)' }}>
                  <Check className="h-3 w-3" style={{ color: '#10B981' }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
          <Logo className="h-5 w-5" />
          CNPJ Brasil Track © {new Date().getFullYear()} · Monitoramento fiscal para contadores
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-xs font-mono transition-colors duration-200" style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#818cf8')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.5)')}>
            Entrar na plataforma
          </Link>
          <Link to="/login" className="text-xs font-mono transition-colors duration-200" style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#818cf8')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.5)')}>
            Criar conta grátis
          </Link>
        </div>
      </footer>
    </div>
  );
}
