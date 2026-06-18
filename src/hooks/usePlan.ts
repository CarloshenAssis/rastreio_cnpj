import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  name: string;
  max_queries: number;
  max_monitored: number;
  max_pdfs: number;
  max_exports: number;
  price_cents: number;
  features: string[];
  email_alerts: boolean;
  monitor_fields: string[];
  allowed_frequencies: string[];
}

export interface UsageStats {
  queriesThisMonth: number;
  monitoredCount: number;
  pdfsThisMonth: number;
  exportsThisMonth: number;
}

const FREE_PLAN: Plan = {
  id: "",
  name: "Free",
  max_queries: 20,
  max_monitored: 10,
  max_pdfs: 3,
  max_exports: 1,
  price_cents: 0,
  features: ["20 consultas/mês", "10 empresas monitoradas"],
  email_alerts: false,
  monitor_fields: ["regime_tributario", "status_cadastral"],
  allowed_frequencies: ["monthly", "biweekly"],
};

export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<UsageStats>({ queriesThisMonth: 0, monitoredCount: 0, pdfsThisMonth: 0, exportsThisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const som = startOfMonth.toISOString();

      const [{ data: userPlanData }, { data: usageLogs }, { data: cnpjs }] = await Promise.all([
        supabase.from("user_plans").select("*, plans(*)").maybeSingle(),
        supabase.from("usage_logs").select("action,quantity").gte("created_at", som),
        supabase.from("cnpjs").select("id", { count: "exact", head: true }),
      ]);

      if (userPlanData?.plans) {
        const p = userPlanData.plans as any;
        setPlan({
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
          monitor_fields: Array.isArray(p.monitor_fields) ? p.monitor_fields : FREE_PLAN.monitor_fields,
          allowed_frequencies: Array.isArray(p.allowed_frequencies) ? p.allowed_frequencies : FREE_PLAN.allowed_frequencies,
        });
      } else {
        setPlan(FREE_PLAN);
      }

      const logs = usageLogs || [];
      const queries = logs.filter((l: any) => l.action === "consulta_cnpj").reduce((a: number, l: any) => a + (l.quantity || 1), 0);
      const pdfs = logs.filter((l: any) => l.action === "pdf_gerado").reduce((a: number, l: any) => a + (l.quantity || 1), 0);
      const exports = logs.filter((l: any) => l.action === "export_lote").reduce((a: number, l: any) => a + (l.quantity || 1), 0);

      setUsage({
        queriesThisMonth: queries,
        monitoredCount: (cnpjs as any)?.length ?? 0,
        pdfsThisMonth: pdfs,
        exportsThisMonth: exports,
      });
      setLoading(false);
    })();
  }, []);

  const logAction = async (action: string, qty = 1) => {
    await supabase.from("usage_logs").insert({ action, quantity: qty } as any);
    setUsage((prev) => ({
      ...prev,
      queriesThisMonth: action === "consulta_cnpj" ? prev.queriesThisMonth + qty : prev.queriesThisMonth,
      pdfsThisMonth: action === "pdf_gerado" ? prev.pdfsThisMonth + qty : prev.pdfsThisMonth,
      exportsThisMonth: action === "export_lote" ? prev.exportsThisMonth + qty : prev.exportsThisMonth,
    }));
  };

  const canQuery = plan ? (plan.max_queries === -1 || usage.queriesThisMonth < plan.max_queries) : false;
  const canMonitor = plan ? (plan.max_monitored === -1 || usage.monitoredCount < plan.max_monitored) : false;
  const canPdf = plan ? (plan.max_pdfs === -1 || usage.pdfsThisMonth < plan.max_pdfs) : false;
  const canExport = plan ? (plan.max_exports === -1 || usage.exportsThisMonth < plan.max_exports) : false;

  return { plan, usage, loading, logAction, canQuery, canMonitor, canPdf, canExport };
}
