import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Trash2, RefreshCw, Loader2, Search, FileSpreadsheet, FileText,
  Star, Tag, X, Plus, Clock,
} from "lucide-react";
import { PDFReportButton } from "@/components/PDFReportButton";
import { gerarRelatorioLote } from "@/lib/pdf";
import { formatCNPJ, formatDateTimeBR } from "@/lib/cnpj";
import { RegimeBadge, StatusBadge, SimplesBadge } from "@/components/CNPJBadges";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CNPJRow {
  id: string;
  cnpj: string;
  razao_social: string | null;
  regime_tributario: string | null;
  simples_nacional: boolean | null;
  status_cadastral: string | null;
  last_checked_at: string | null;
  isFavorite?: boolean;
  tags?: { id: string; name: string; color: string }[];
  frequency?: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const FREQ_LABELS: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};

export default function Monitoramento() {
  const [rows, setRows] = useState<CNPJRow[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [regimeFilter, setRegimeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string>("");
  const [rechecking, setRechecking] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: cnpjData }, { data: favData }, { data: tagsData }, { data: companyTagsData }, { data: monitorSettings }] =
      await Promise.all([
        supabase.from("cnpjs").select("id, cnpj, razao_social, regime_tributario, simples_nacional, status_cadastral, last_checked_at").order("razao_social", { ascending: true, nullsFirst: false }),
        supabase.from("favorites").select("company_id"),
        supabase.from("tags").select("id, name, color"),
        supabase.from("company_tags").select("company_id, tags(id, name, color)"),
        supabase.from("monitor_settings").select("company_id, frequency"),
      ]);

    const favSet = new Set((favData || []).map((f: any) => f.company_id));
    setFavorites(favSet);
    setTags((tagsData as any) || []);

    const tagsByCompany: Record<string, { id: string; name: string; color: string }[]> = {};
    for (const ct of (companyTagsData || []) as any[]) {
      if (!tagsByCompany[ct.company_id]) tagsByCompany[ct.company_id] = [];
      if (ct.tags) tagsByCompany[ct.company_id].push(ct.tags);
    }

    const freqByCompany: Record<string, string> = {};
    for (const ms of (monitorSettings || []) as any[]) {
      freqByCompany[ms.company_id] = ms.frequency;
    }

    setRows(
      ((cnpjData as any) || []).map((r: any) => ({
        ...r,
        isFavorite: favSet.has(r.id),
        tags: tagsByCompany[r.id] || [],
        frequency: freqByCompany[r.id] || "weekly",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => {
    if (showFavOnly && !r.isFavorite) return false;
    if (filter.trim()) {
      const q = filter.trim().toLowerCase();
      const digits = filter.replace(/\D/g, "");
      const matchCnpj = digits.length > 0 && r.cnpj.includes(digits);
      const matchRazao = !!r.razao_social?.toLowerCase().includes(q);
      if (!matchCnpj && !matchRazao) return false;
    }
    if (regimeFilter && r.regime_tributario !== regimeFilter) return false;
    if (statusFilter && r.status_cadastral !== statusFilter) return false;
    if (tagFilter && !r.tags?.some((t) => t.id === tagFilter)) return false;
    return true;
  });

  const exportData = async (format: "xlsx" | "csv") => {
    const data = (selected.size ? filtered.filter((r) => selected.has(r.id)) : filtered).map((r) => ({
      CNPJ: formatCNPJ(r.cnpj),
      "Razão Social": r.razao_social || "",
      Regime: r.regime_tributario || "",
      "Simples Nacional": r.simples_nacional === null ? "" : r.simples_nacional ? "Sim" : "Não",
      Status: r.status_cadastral || "",
      Tags: r.tags?.map((t) => t.name).join(", ") || "",
      "Última Verificação": r.last_checked_at ? formatDateTimeBR(r.last_checked_at) : "",
    }));
    if (!data.length) { toast.error("Nada para exportar."); return; }
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monitoramento");
    const date = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `cnpjtrack-monitoramento-${date}.csv`; a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(wb, `cnpjtrack-monitoramento-${date}.xlsx`);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (favorites.has(id)) {
      await supabase.from("favorites").delete().eq("company_id", id);
      setFavorites((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, isFavorite: false } : r));
    } else {
      await supabase.from("favorites").insert({ company_id: id } as any);
      setFavorites((prev) => new Set([...prev, id]));
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, isFavorite: true } : r));
    }
  };

  const createTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const colors = ["#6366f1", "#22d3ee", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sessão expirada."); return; }
    const { data, error } = await supabase.from("tags").insert({ name, color, user_id: user.id } as any).select().single();
    if (error) { toast.error(error.message); return; }
    setTags((prev) => [...prev, data as any]);
    setNewTagName("");
    setShowTagInput(false);
    toast.success(`Tag "${name}" criada.`);
  };

  const toggleTag = async (companyId: string, tagId: string, hasTag: boolean) => {
    if (hasTag) {
      await supabase.from("company_tags").delete().eq("company_id", companyId).eq("tag_id", tagId);
    } else {
      await supabase.from("company_tags").insert({ company_id: companyId, tag_id: tagId } as any);
    }
    await load();
  };

  const setFrequency = async (companyId: string, frequency: string) => {
    const { error } = await supabase.from("monitor_settings").upsert(
      { company_id: companyId, frequency, updated_at: new Date().toISOString() } as any,
      { onConflict: "company_id" }
    );
    if (error) { toast.error(error.message); return; }
    setRows((prev) => prev.map((r) => r.id === companyId ? { ...r, frequency } : r));
    toast.success("Frequência atualizada.");
  };

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const removeIds = async (ids: string[]) => {
    if (!ids.length) return;
    if (!confirm(`Remover ${ids.length} CNPJ(s) do monitoramento? O histórico também será apagado.`)) return;
    const { error } = await supabase.from("cnpjs").delete().in("id", ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} CNPJ(s) removido(s).`);
    setSelected(new Set());
    load();
  };

  const recheckSelected = async () => {
    const ids = selected.size ? Array.from(selected) : filtered.map((r) => r.id);
    const cnpjs = rows.filter((r) => ids.includes(r.id)).map((r) => r.cnpj);
    if (!cnpjs.length) { toast.error("Nada para verificar."); return; }
    setRechecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("consulta-cnpj", { body: { cnpjs, force: true } });
      if (error) throw error;
      toast.success(`Re-verificação concluída: ${data.summary.success} ok, ${data.summary.changed} mudanças.`);
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setRechecking(false); }
  };

  return (
    <div>
      <PageHeader
        title="Monitoramento"
        subtitle={`${rows.length} CNPJs sob monitoramento`}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => exportData("csv")} disabled={filtered.length === 0} variant="outline" size="sm" className="font-mono text-[11px] uppercase">
              <FileText className="h-3.5 w-3.5 mr-1.5" />CSV
            </Button>
            <Button onClick={() => exportData("xlsx")} disabled={filtered.length === 0} variant="outline" size="sm" className="font-mono text-[11px] uppercase">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />XLSX
            </Button>
            <Button
              onClick={async () => {
                try {
                  toast.info("Gerando relatório PDF…");
                  const data = selected.size
                    ? filtered.filter((r) => selected.has(r.id))
                    : filtered;
                  await gerarRelatorioLote(data);
                  toast.success("Relatório PDF gerado.");
                } catch (e: any) { toast.error(e.message); }
              }}
              disabled={filtered.length === 0}
              variant="outline" size="sm" className="font-mono text-[11px] uppercase"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />PDF Lote
            </Button>
            <Button
              onClick={recheckSelected}
              disabled={rechecking || filtered.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase"
            >
              {rechecking ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              {selected.size ? `Verificar ${selected.size}` : "Verificar Todos"}
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filtros */}
        <div className="terminal-card p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por CNPJ ou razão social…" className="pl-8 font-mono text-xs h-8" />
          </div>
          <select value={regimeFilter} onChange={(e) => setRegimeFilter(e.target.value)} className="bg-input border border-border rounded-sm px-2 h-8 font-mono text-xs">
            <option value="">Todos regimes</option>
            <option value="MEI">MEI</option>
            <option value="Simples">Simples</option>
            <option value="Lucro Presumido">Lucro Presumido</option>
            <option value="Lucro Real">Lucro Real</option>
            <option value="Indefinido">Indefinido</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input border border-border rounded-sm px-2 h-8 font-mono text-xs">
            <option value="">Todos status</option>
            <option value="Ativa">Ativa</option>
            <option value="Suspensa">Suspensa</option>
            <option value="Inapta">Inapta</option>
            <option value="Baixada">Baixada</option>
          </select>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-input border border-border rounded-sm px-2 h-8 font-mono text-xs"
          >
            <option value="">Todas as tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFavOnly((v) => !v)}
            className={cn("h-8 px-2.5 rounded-sm border font-mono text-xs flex items-center gap-1.5 transition-colors", showFavOnly ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}
          >
            <Star className={cn("h-3.5 w-3.5", showFavOnly && "fill-current")} />
            Favoritos
          </button>
          {selected.size > 0 && (
            <Button onClick={() => removeIds(Array.from(selected))} variant="destructive" size="sm" className="font-mono text-[11px] uppercase">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Remover {selected.size}
            </Button>
          )}
        </div>

        {/* Gestão de Tags */}
        <div className="terminal-card p-3 flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Tags:</span>
          {tags.map((tag) => (
            <span key={tag.id} className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: tag.color, color: tag.color }}>
              {tag.name}
            </span>
          ))}
          {showTagInput ? (
            <div className="flex items-center gap-1.5">
              <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createTag()} placeholder="Nome da tag…" className="font-mono text-xs h-6 w-32 px-2" />
              <Button onClick={createTag} size="sm" className="h-6 px-2 text-[10px]">Criar</Button>
              <Button onClick={() => setShowTagInput(false)} variant="ghost" size="sm" className="h-6 px-1"><X className="h-3 w-3" /></Button>
            </div>
          ) : (
            <button onClick={() => setShowTagInput(true)} className="font-mono text-[10px] text-muted-foreground/60 hover:text-primary flex items-center gap-1">
              <Plus className="h-3 w-3" />Nova tag
            </button>
          )}
        </div>

        {/* Tabela */}
        <div className="terminal-card overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">Carregando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-muted-foreground">
              {rows.length === 0 ? "Nenhum CNPJ monitorado ainda. Vá em Consulta para adicionar." : "Nenhum resultado para os filtros."}
            </div>
          ) : (
            <table className="data-table w-full">
              <thead className="bg-background-deep/40">
                <tr>
                  <th className="px-3 py-2.5 w-8"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></th>
                  <th className="px-3 py-2.5 w-8"></th>
                  <th className="text-left px-4 py-2.5">CNPJ</th>
                  <th className="text-left px-4 py-2.5">Razão Social</th>
                  <th className="text-left px-4 py-2.5">Regime</th>
                  <th className="text-left px-4 py-2.5">Simples</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Tags</th>
                  <th className="text-left px-4 py-2.5">Frequência</th>
                  <th className="text-left px-4 py-2.5">Última Verificação</th>
                  <th className="text-right px-4 py-2.5">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={cn("border-t border-border/50 hover:bg-muted/20", selected.has(r.id) && "bg-primary/5")}>
                    <td className="px-3 py-2.5">
                      <Checkbox checked={selected.has(r.id)} onCheckedChange={(v) => {
                        const next = new Set(selected);
                        if (v) next.add(r.id); else next.delete(r.id);
                        setSelected(next);
                      }} />
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => toggleFavorite(r.id)} className={cn("transition-colors", r.isFavorite ? "text-warning" : "text-muted-foreground/30 hover:text-warning/60")}>
                        <Star className={cn("h-3.5 w-3.5", r.isFavorite && "fill-current")} />
                      </button>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{formatCNPJ(r.cnpj)}</td>
                    <td className="px-4 py-2.5 font-sans text-xs">{r.razao_social || "—"}</td>
                    <td className="px-4 py-2.5"><RegimeBadge regime={r.regime_tributario} /></td>
                    <td className="px-4 py-2.5"><SimplesBadge simples={r.simples_nacional} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status_cadastral} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(r.tags || []).map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(r.id, tag.id, true)}
                            title="Remover tag"
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 hover:opacity-70"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.name} <X className="h-2 w-2" />
                          </button>
                        ))}
                        {tags.filter((t) => !(r.tags || []).find((rt) => rt.id === t.id)).map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(r.id, tag.id, false)}
                            title={`Adicionar tag "${tag.name}"`}
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-dashed opacity-30 hover:opacity-70"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            + {tag.name}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={r.frequency || "weekly"}
                        onChange={(e) => setFrequency(r.id, e.target.value)}
                        className="bg-transparent border border-border/50 rounded-sm px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-primary/50 transition-colors"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="biweekly">Quinzenal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatDateTimeBR(r.last_checked_at)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PDFReportButton
                          cnpj={r.cnpj}
                          dbData={r}
                          companyId={r.id}
                          variant="ghost"
                          label="PDF"
                        />
                        <Button onClick={() => removeIds([r.id])} variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
