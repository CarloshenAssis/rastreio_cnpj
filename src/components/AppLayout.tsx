import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts } from "@/hooks/useAlerts";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Search, Activity, LogOut, TerminalSquare,
  Bell, History, CreditCard, Shield, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "carloshen.senai@gmail.com";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consulta", label: "Consulta", icon: Search },
  { to: "/monitoramento", label: "Monitoramento", icon: Activity },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/alertas", label: "Alertas", icon: Bell, badge: true },
  { to: "/planos", label: "Planos", icon: CreditCard },
];

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { unread } = useAlerts();
  const { usage } = usePlan();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav("/login", { replace: true });
  }, [loading, user, nav]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    nav("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-mono text-xs text-muted-foreground">Carregando…</div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-56 shrink-0 bg-background-deep border-r border-sidebar-border flex flex-col">
        <div className="px-4 py-5 border-b border-sidebar-border flex items-center gap-2">
          <TerminalSquare className="h-5 w-5 text-primary" />
          <div>
            <div className="font-mono text-sm font-semibold tracking-tight">CNPJTrack</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">terminal fiscal</div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {[...NAV, ...(user?.email === ADMIN_EMAIL ? [{ to: "/admin", label: "Admin", icon: Shield, badge: false }] : [])].map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-primary border-l-2 border-primary -ml-px"
                )
              }
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {badge && unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center leading-none">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <span className="flex-1">{label}</span>
              {badge && unread > 0 && (
                <span className="font-mono text-[9px] bg-destructive/20 text-destructive px-1 rounded">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="font-mono text-[10px] text-muted-foreground truncate" title={user.email ?? ""}>
            {user.email}
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            <span className="text-xs">Sair</span>
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto flex flex-col">
        {usage.isTrial && usage.trialDaysLeft !== null && (
          <div className={cn(
            "flex items-center justify-between px-5 py-2 text-xs font-mono border-b",
            usage.trialDaysLeft <= 1
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          )}>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {usage.trialDaysLeft === 0
                ? "Seu trial expira hoje! Assine para continuar."
                : `Trial grátis: ${usage.trialDaysLeft} dia${usage.trialDaysLeft === 1 ? "" : "s"} restante${usage.trialDaysLeft === 1 ? "" : "s"} do plano Starter.`}
            </div>
            <Link to="/planos" className="underline hover:no-underline">Assinar agora</Link>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
