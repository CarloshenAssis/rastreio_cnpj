import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, AlertCircle, CheckCircle2, FileSpreadsheet, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { parseCNPJList, formatCNPJ, stripCNPJ, validateCNPJ, formatDateTimeBR } from "@/lib/cnpj";
import { RegimeBadge, StatusBadge, SimplesBadge } from "@/components/CNPJBadges";
import { PDFReportButton } from "@/components/PDFReportButton";
import { gerarRelatorioLote } from "@/lib/pdf";
import { cn } from "@/lib/utils";

type RowResult = {
  cnpj: string;
  status: "created" | "updated" | "cached" | "error";
  changed?: boolean;
  error?: string;
  data?: any;
};

export default function Consulta() {
  const [pasted, setPasted] = useState("");
  const [single, setSingle] = useState("");
  const [singleMasked, setSingleMasked] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; msg: string } | null>(null);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [summary, setSummary] = useState<{ total: number; success: number; errors: number; changed: number } | null>(null);

  const parsed = parseCNPJList(pasted);

  const consultar = async (cnpjs: string[]) => {
    if (!cnpjs.length) { toast.error("Nenhum CNPJ válido para consultar."); return; }
    setBusy(true); setResults(null); setSummary(null);

    const BATCH_SIZE = 100;
    const batches: string[][] = [];
    for (let i = 0; i < cnpjs.length; i += BATCH_SIZE) batches.push(cnpjs.slice(i, i + BATCH_SIZE));

    setProgress({ stage: "validating", msg: `Validando ${cnpjs.length} CNPJs em ${batches.length} lote(s)...` });
    await new Promise((r) => setTimeout(r, 150));

    const allResults: RowResult[] = [];
    const agg = { total: 0, success: 0, errors: 0, changed: 0 };

    try {
      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const from = b * BATCH_SIZE + 1;
        const to = b * BATCH_SIZE + batch.length;
        setProgress({
          stage: "querying",
          msg: `Lote ${b + 1}/${batches.length} — consultando CNPJs ${from}–${to} de ${cnpjs.length}...`,
        });

        const { data, error } = await supabase.functions.invoke("consulta-cnpj", { body: { cnpjs: batch } });
        if (error) throw error;

        allResults.push(...(data.results as RowResult[]));
        agg.total += data.summary.total;
        agg.success += data.summary.success;
        agg.errors += data.summary.errors;
        agg.changed += data.summary.changed;

        // Atualiza incrementalmente para o usuário ver o progresso
        setResults([...allResults]);
        setSummary({ ...agg });
      }
      toast.success(`Consulta concluída: ${agg.success} sucesso, ${agg.errors} erro(s) em ${batches.length} lote(s).`);
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
      if (allResults.length) { setResults(allResults); setSummary(agg); }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleSingleChange = (v: string) => {
    const digits = stripCNPJ(v).slice(0, 14);
    setSingle(digits);
    let masked = digits;
    if (digits.length > 12) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`;
    else if (digits.length > 8) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`;
    else if (digits.length > 5) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`;
    else if (digits.length > 2) masked = `${digits.slice(0,2)}.${digits.slice(2)}`;
    setSingleMasked(masked);
  };

  const exportXlsx = async () => {
    if (!results) return;
    const XLSX = await import("xlsx");
    const rows = results.filter((r) => r.data).map((r) => ({
      CNPJ: formatCNPJ(r.cnpj),
      "Razão Social": r.data?.razao_social || "",
      "Simples Nacional": r.data?.simples_nacional ? "Sim" : "Não",
      Regime: r.data?.regime_tributario || "",
      "Data Início Regime": r.data?.data_inicio_regime || "",
      Status: r.data?.status_cadastral || "",
      Município: r.data?.municipio || "",
      UF: r.data?.uf || "",
      "Consultado em": r.data?.last_checked_at || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CNPJs");
    XLSX.writeFile(wb, `cnpjtrack-consulta-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div>
      <PageHeader title="Consulta" subtitle="Importe ou pesquise CNPJs em lote" />
      <div className="p-6 space-y-6">
        <div className="terminal-card p-5">
          <Tabs defaultValue="paste">
            <TabsList className="grid grid-cols-3 mb-5 max-w-xl">
              <TabsTrigger value="paste" className="font-mono text-[11px] uppercase">Colar Lista</TabsTrigger>
              <TabsTrigger value="upload" className="font-mono text-[11px] uppercase">Upload Arquivo</TabsTrigger>
              <TabsTrigger value="single" className="font-mono text-[11px] uppercase">CNPJ Individual</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-3">
              <Textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="Cole aqui os CNPJs (um por linha ou separados por vírgula)"
                className="font-mono text-xs min-h-[200px] resize-y"
              />
              <div className="flex items-center justify-between">
                <div className="font-mono text-[11px] text-muted-foreground">
                  <span className="text-primary tabular-nums">{parsed.valid.length}</span> válidos
                  {parsed.invalid.length > 0 && (
                    <> · <span className="text-destructive tabular-nums">{parsed.invalid.length}</span> inválidos</>
                  )}
                </div>
                <Button
                  onClick={() => consultar(parsed.valid)}
                  disabled={busy || !parsed.valid.length}
                  className="bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase"
                >
                  {busy ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>Processando</> : `Consultar ${parsed.valid.length} CNPJs →`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload">
              <UploadTab onConsultar={consultar} busy={busy} />
            </TabsContent>

            <TabsContent value="single" className="space-y-3">
              <div className="max-w-md">
                <Input
                  value={singleMasked}
                  onChange={(e) => handleSingleChange(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="font-mono text-base tracking-wider"
                />
                <div className="font-mono text-[11px] text-muted-foreground mt-2">
                  {single.length === 14 && validateCNPJ(single)
                    ? <span className="text-success">CNPJ válido</span>
                    : single.length === 14
                      ? <span className="text-destructive">CNPJ inválido (dígitos verificadores)</span>
                      : `${single.length}/14 dígitos`}
                </div>
              </div>
              <Button
                onClick={() => consultar([single])}
                disabled={busy || !validateCNPJ(single)}
                className="bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase"
              >
                {busy ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>Processando</> : "Consultar →"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {progress && (
          <div className="terminal-card p-4 flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <div className="font-mono text-xs">{progress.msg}</div>
          </div>
        )}

        {results && (
          <div className="terminal-card">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success"/>{summary?.success} sucesso</span>
                {(summary?.errors ?? 0) > 0 && <span className="flex items-center gap-1.5 text-destructive"><AlertCircle className="h-3.5 w-3.5"/>{summary?.errors} erros</span>}
                {(summary?.changed ?? 0) > 0 && <span className="text-warning">{summary?.changed} mudanças detectadas</span>}
              </div>
              <Button onClick={exportXlsx} variant="outline" size="sm" className="font-mono text-[11px] uppercase">
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5"/>Exportar XLSX
              </Button>
              <Button
                onClick={async () => {
                  try {
                    toast.info("Gerando relatório PDF em lote…");
                    const data = (results || []).filter((r) => r.data).map((r) => r.data);
                    await gerarRelatorioLote(data);
                    toast.success("Relatório PDF gerado.");
                  } catch (e: any) { toast.error(e.message); }
                }}
                variant="outline" size="sm" className="font-mono text-[11px] uppercase"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5"/>PDF Lote
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead className="bg-background-deep/40">
                  <tr>
                    <th className="text-left px-4 py-2.5">CNPJ</th>
                    <th className="text-left px-4 py-2.5">Razão Social</th>
                    <th className="text-left px-4 py-2.5">Simples</th>
                    <th className="text-left px-4 py-2.5">Regime</th>
                    <th className="text-left px-4 py-2.5">Status</th>
                    <th className="text-left px-4 py-2.5">UF</th>
                    <th className="text-left px-4 py-2.5">Consultado em</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={cn(
                      "border-t border-border/50",
                      r.changed && "bg-warning/5",
                      r.status === "error" && "bg-destructive/5"
                    )}>
                      <td className="px-4 py-2.5 tabular-nums">{formatCNPJ(r.cnpj)}</td>
                      <td className="px-4 py-2.5 font-sans text-xs">
                        {r.status === "error"
                          ? <span className="text-destructive">{r.error}</span>
                          : (r.data?.razao_social || "—")}
                      </td>
                      <td className="px-4 py-2.5"><SimplesBadge simples={r.data?.simples_nacional}/></td>
                      <td className="px-4 py-2.5"><RegimeBadge regime={r.data?.regime_tributario}/></td>
                      <td className="px-4 py-2.5"><StatusBadge status={r.data?.status_cadastral}/></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.data?.uf || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDateTimeBR(r.data?.last_checked_at)}</td>
                      <td className="px-4 py-2.5">
                        {r.data && (
                          <PDFReportButton
                            cnpj={r.cnpj}
                            dbData={r.data}
                            companyId={r.data?.id}
                            variant="ghost"
                            label="PDF"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadTab({ onConsultar, busy }: { onConsultar: (c: string[]) => void; busy: boolean }) {
  const [rows, setRows] = useState<Record<string, any>[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    let data: Record<string, any>[] = [];
    if (file.name.toLowerCase().endsWith(".csv")) {
      const Papa = (await import("papaparse")).default;
      const text = new TextDecoder().decode(buf);
      const parsed = Papa.parse<Record<string, any>>(text, { header: true, skipEmptyLines: true });
      data = parsed.data;
    } else {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
    }
    if (!data.length) { toast.error("Arquivo vazio."); return; }
    const cols = Object.keys(data[0]);
    setRows(data); setColumns(cols);
    const auto = cols.find((c) => /^cnpj|documento$/i.test(c.trim())) || cols[0];
    setSelectedCol(auto);
  };

  const cnpjs = rows && selectedCol
    ? rows.map((r) => stripCNPJ(String(r[selectedCol] ?? ""))).filter((c) => c.length === 14)
    : [];

  return (
    <div className="space-y-4">
      <label className={cn(
        "border-2 border-dashed border-border-strong rounded-sm p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
        rows && "border-primary/40 bg-primary/5"
      )}>
        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
        <div className="font-mono text-xs text-muted-foreground mb-1">
          {fileName || "Arraste um arquivo .xlsx, .xls ou .csv aqui ou clique para selecionar"}
        </div>
        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>

      {rows && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">Coluna do CNPJ:</div>
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="bg-input border border-border rounded-sm px-2 py-1 font-mono text-xs"
            >
              {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="font-mono text-[11px] text-muted-foreground">
              <span className="text-primary tabular-nums">{cnpjs.length}</span> CNPJs válidos de {rows.length} linhas
            </div>
          </div>

          <div className="terminal-card overflow-x-auto">
            <table className="data-table w-full">
              <thead className="bg-background-deep/40">
                <tr>{columns.map((c) => <th key={c} className={cn("text-left px-3 py-2", c === selectedCol && "text-primary")}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-border/50">
                    {columns.map((c) => <td key={c} className={cn("px-3 py-2", c === selectedCol && "text-primary tabular-nums")}>{String(r[c] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && <div className="px-3 py-2 font-mono text-[10px] text-muted-foreground border-t border-border/50">… mais {rows.length - 5} linhas</div>}
          </div>

          <Button
            onClick={() => onConsultar(cnpjs)}
            disabled={busy || !cnpjs.length}
            className="bg-primary text-primary-foreground hover:bg-primary-glow font-mono text-xs uppercase"
          >
            {busy ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>Processando</> : `Confirmar e Consultar ${cnpjs.length} CNPJs →`}
          </Button>
        </>
      )}
    </div>
  );
}
