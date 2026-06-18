import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key, Copy, Check, Plus } from "lucide-react";
import { formatDateTimeBR } from "@/lib/cnpj";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "carloshen.senai@gmail.com";

type Tab = "codes" | "users";

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("codes");
  const [codes, setCodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [planName, setPlanName] = useState("Personalizado");
  const [expiresDays, setExpiresDays] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  if (user && user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;

  const loadCodes = async () => {
    const { data } = await supabase.rpc("admin_list_codes" as any);
    setCodes((data as any) || []);
  };

  const loadUsers = async () => {
    const { data } = await supabase.rpc("admin_list_users" as any);
    setUsers((data as any) || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadCodes(), loadUsers()]);
      setLoading(false);
    })();
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    const { data, error } = await supabase.rpc("admin_generate_code" as any, {
      p_plan_name: planName,
      p_expires_days: expiresDays ? parseInt(expiresDays) : null,
    });
    setGenerating(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Código gerado: ${data}`);
    await loadCodes();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle="Painel administrativo — acesso restrito"
        actions={
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-sm">
            <Shield className="h-3 w-3" />
            {user?.email}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="terminal-card p-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Usuários</div>
            <div className="font-mono text-2xl tabular-nums">{users.length}</div>
          </div>
          <div className="terminal-card p-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Códigos gerados</div>
            <div className="font-mono text-2xl tabular-nums">{codes.length}</div>
          </div>
          <div className="terminal-card p-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Códigos usados</div>
            <div className="font-mono text-2xl tabular-nums">{codes.filter((c) => c.used_at).length}</div>
          </div>
          <div className="terminal-card p-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Disponíveis</div>
            <div className="font-mono text-2xl tabular-nums">{codes.filter((c) => !c.used_at).length}</div>
          </div>
        </div>

        {/* Gerador de código */}
        <div className="terminal-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-amber-400" />
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Gerar código de acesso</div>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground mb-1">Plano</div>
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="bg-input border border-border rounded-sm px-2 h-8 font-mono text-xs"
              >
                <option value="Free">Free</option>
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Personalizado">Personalizado</option>
              </select>
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted-foreground mb-1">Validade (dias, opcional)</div>
              <input
                type="number"
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value)}
                placeholder="Sem validade"
                className="bg-input border border-border rounded-sm px-2 h-8 font-mono text-xs w-36"
                min={1}
              />
            </div>
            <Button
              onClick={generateCode}
              disabled={generating}
              className="bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs uppercase"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {generating ? "Gerando…" : "Gerar código"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {([["codes", "Códigos", Key], ["users", "Usuários", Users]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 font-mono text-xs border-b-2 -mb-px transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tabela de códigos */}
        {tab === "codes" && (
          <div className="terminal-card overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>
            ) : codes.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground">Nenhum código gerado ainda.</div>
            ) : (
              <table className="data-table w-full">
                <thead className="bg-background-deep/40">
                  <tr>
                    <th className="text-left px-4 py-2.5">Código</th>
                    <th className="text-left px-4 py-2.5">Plano</th>
                    <th className="text-left px-4 py-2.5">Usado por</th>
                    <th className="text-left px-4 py-2.5">Usado em</th>
                    <th className="text-left px-4 py-2.5">Criado em</th>
                    <th className="text-left px-4 py-2.5">Expira</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-mono text-sm tracking-widest font-bold",
                            c.used_at ? "text-muted-foreground line-through" : "text-amber-400"
                          )}>{c.code}</span>
                          {!c.used_at && (
                            <button onClick={() => copy(c.code)} className="text-muted-foreground hover:text-primary">
                              {copied === c.code ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="font-mono text-[10px]">{c.plan_name}</Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {c.used_by_email || <span className="text-primary">disponível</span>}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {c.used_at ? formatDateTimeBR(c.used_at) : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {formatDateTimeBR(c.created_at)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {c.expires_at ? formatDateTimeBR(c.expires_at) : "Sem validade"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tabela de usuários */}
        {tab === "users" && (
          <div className="terminal-card overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground">Nenhum usuário ainda.</div>
            ) : (
              <table className="data-table w-full">
                <thead className="bg-background-deep/40">
                  <tr>
                    <th className="text-left px-4 py-2.5">Email</th>
                    <th className="text-left px-4 py-2.5">Plano</th>
                    <th className="text-left px-4 py-2.5">CNPJs/mês</th>
                    <th className="text-left px-4 py-2.5">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[10px]",
                            u.plan_name === "Personalizado" && "border-amber-500/60 text-amber-400",
                            u.plan_name === "Pro" && "border-primary/60 text-primary",
                          )}
                        >
                          {u.plan_name}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">{u.queries_this_month}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {formatDateTimeBR(u.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
