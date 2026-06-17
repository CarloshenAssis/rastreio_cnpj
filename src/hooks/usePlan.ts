import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  name: string;
  max_queries: number;
  max_monitored: number;
  price_cents: number;
  features: string[];
}

export interface UsageStats {
  queriesThisMonth: number;
  monitoredCount: number;
}

export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<UsageStats>({ queriesThisMonth: 0, monitoredCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [{ data: userPlanData }, { data: usageLogs }, { data: cnpjs }] = await Promise.all([
        supabase.from("user_plans").select("*, plans(*)").maybeSingle(),
        supabase.from("usage_logs").select("quantity").eq("action", "query").gte("created_at", startOfMonth.toISOString()),
        supabase.from("cnpjs").select("id", { count: "exact", head: true }),
      ]);

      if (userPlanData?.plans) {
        const p = userPlanData.plans as any;
        setPlan({
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
        });
      } else {
        // default Free plan
        setPlan({ id: "", name: "Free", max_queries: 20, max_monitored: 5, price_cents: 0, features: ["20 consultas/mês", "5 empresas monitoradas"] });
      }

      const queries = (usageLogs || []).reduce((acc, l: any) => acc + (l.quantity || 1), 0);
      setUsage({ queriesThisMonth: queries, monitoredCount: (cnpjs as any)?.length ?? 0 });
      setLoading(false);
    })();
  }, []);

  const logQuery = async (qty = 1) => {
    await supabase.from("usage_logs").insert({ action: "query", quantity: qty } as any);
    setUsage((prev) => ({ ...prev, queriesThisMonth: prev.queriesThisMonth + qty }));
  };

  const canQuery = plan ? (plan.max_queries === -1 || usage.queriesThisMonth < plan.max_queries) : false;
  const canMonitor = plan ? (plan.max_monitored === -1 || usage.monitoredCount < plan.max_monitored) : false;

  return { plan, usage, loading, logQuery, canQuery, canMonitor };
}
