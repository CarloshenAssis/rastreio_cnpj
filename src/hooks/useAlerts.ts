import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Alert {
  id: string;
  company_id: string;
  event_type: string;
  description: string;
  created_at: string;
  read_at: string | null;
  cnpjs?: { cnpj: string; razao_social: string | null } | null;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*, cnpjs(cnpj, razao_social)")
      .order("created_at", { ascending: false })
      .limit(50);
    setAlerts((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = alerts.filter((a) => !a.read_at).length;

  const markRead = async (id: string) => {
    await supabase.from("alerts").update({ read_at: new Date().toISOString() }).eq("id", id);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read_at: new Date().toISOString() } : a));
  };

  const markAllRead = async () => {
    const ids = alerts.filter((a) => !a.read_at).map((a) => a.id);
    if (!ids.length) return;
    await supabase.from("alerts").update({ read_at: new Date().toISOString() }).in("id", ids);
    setAlerts((prev) => prev.map((a) => ({ ...a, read_at: a.read_at ?? new Date().toISOString() })));
  };

  return { alerts, unread, loading, markRead, markAllRead, reload: load };
}
