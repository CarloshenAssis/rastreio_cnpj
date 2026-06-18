// CNPJTrack — consulta de CNPJ com BrasilAPI + ReceitaWS fallback
// Cache 24h em public.cnpjs. Detecta mudanças e grava em cnpj_history.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Origens permitidas — só o domínio da Vercel e localhost para dev
const ALLOWED_ORIGINS = [
  "https://cnpjbrasiltrack.vercel.app",
  "https://cnpjtrack-sooty.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:5174",
];

function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

interface NormalizedCNPJ {
  cnpj: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  simples_nacional: boolean | null;
  regime_tributario: "MEI" | "Simples" | "Lucro Presumido" | "Lucro Real" | "Indefinido";
  status_cadastral: "Ativa" | "Inapta" | "Suspensa" | "Baixada" | "Nula" | "Indefinido";
  data_inicio_regime: string | null;
  porte: string | null;
  municipio: string | null;
  uf: string | null;
  source: "brasilapi" | "receitaws" | "cache";
}

const TIMEOUT_MS = 8000;
const CACHE_HOURS = 24;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

async function retry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

function mapPorteToRegime(porte?: string | null, simples?: boolean | null, mei?: boolean | null): NormalizedCNPJ["regime_tributario"] {
  if (mei) return "MEI";
  if (simples) return "Simples";
  const p = (porte || "").toUpperCase();
  if (p.includes("DEMAIS") || p.includes("GRANDE")) return "Lucro Presumido";
  return "Indefinido";
}

function mapStatus(s?: string | null): NormalizedCNPJ["status_cadastral"] {
  const v = (s || "").toUpperCase();
  if (v.includes("ATIVA")) return "Ativa";
  if (v.includes("SUSPENSA")) return "Suspensa";
  if (v.includes("INAPTA")) return "Inapta";
  if (v.includes("BAIXADA")) return "Baixada";
  if (v.includes("NULA")) return "Nula";
  return "Indefinido";
}

async function fetchBrasilAPI(cnpj: string): Promise<NormalizedCNPJ> {
  const r = await withTimeout(fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`), TIMEOUT_MS);
  if (!r.ok) throw new Error(`brasilapi ${r.status}`);
  const d = await r.json();
  return {
    cnpj,
    razao_social: d.razao_social ?? null,
    nome_fantasia: d.nome_fantasia ?? null,
    simples_nacional: d.opcao_pelo_simples ?? null,
    regime_tributario: mapPorteToRegime(d.porte, d.opcao_pelo_simples, d.opcao_pelo_mei),
    status_cadastral: mapStatus(d.descricao_situacao_cadastral),
    data_inicio_regime: d.data_opcao_pelo_simples ?? d.data_inicio_atividade ?? null,
    porte: d.porte ?? null,
    municipio: d.municipio ?? null,
    uf: d.uf ?? null,
    source: "brasilapi",
  };
}

async function fetchReceitaWS(cnpj: string): Promise<NormalizedCNPJ> {
  const r = await withTimeout(fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`), TIMEOUT_MS);
  if (!r.ok) throw new Error(`receitaws ${r.status}`);
  const d = await r.json();
  if (d.status === "ERROR") throw new Error(d.message || "receitaws error");
  const simples = d.simples?.optante === true || d.simples?.optante === "true";
  const mei = d.simei?.optante === true || d.simei?.optante === "true";
  return {
    cnpj,
    razao_social: d.nome ?? null,
    nome_fantasia: d.fantasia ?? null,
    simples_nacional: simples,
    regime_tributario: mapPorteToRegime(d.porte, simples, mei),
    status_cadastral: mapStatus(d.situacao),
    data_inicio_regime: d.simples?.data_opcao ?? null,
    porte: d.porte ?? null,
    municipio: d.municipio ?? null,
    uf: d.uf ?? null,
    source: "receitaws",
  };
}

async function fetchCNPJData(cnpj: string): Promise<{ data?: NormalizedCNPJ; error?: string }> {
  try {
    const data = await retry(() => fetchBrasilAPI(cnpj), 1, 800);
    return { data };
  } catch (e1) {
    try {
      const data = await retry(() => fetchReceitaWS(cnpj), 1, 1200);
      return { data };
    } catch (e2) {
      return { error: `BrasilAPI: ${(e1 as Error).message}; ReceitaWS: ${(e2 as Error).message}` };
    }
  }
}

const TRACKED_FIELDS: (keyof NormalizedCNPJ)[] = [
  "razao_social", "simples_nacional", "regime_tributario", "status_cadastral", "data_inicio_regime",
];

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Bloqueia origens não autorizadas em produção
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: "origin not allowed" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    // Rejeita requests sem token de autenticação
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userResp, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userResp.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userResp.user.id;

    // Rate limiting: máx 500 consultas por hora por usuário
    const { data: rateOk } = await admin.rpc("check_rate_limit", {
      p_action: "consulta_cnpj",
      p_limit: 500,
      p_window_minutes: 60,
    });
    if (rateOk === false) {
      return new Response(JSON.stringify({ error: "rate_limit_exceeded", message: "Limite de 100 consultas por hora atingido." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const cnpjs: string[] = Array.isArray(body.cnpjs) ? body.cnpjs : [];
    const force: boolean = !!body.force;
    if (!cnpjs.length) {
      return new Response(JSON.stringify({ error: "no cnpjs" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    const cutoff = new Date(Date.now() - CACHE_HOURS * 3600 * 1000).toISOString();

    for (const raw of cnpjs.slice(0, 100)) {
      const cnpj = (raw || "").replace(/\D/g, "");
      if (cnpj.length !== 14) {
        results.push({ cnpj: raw, status: "error", error: "CNPJ inválido" });
        continue;
      }

      // Check existing record
      const { data: existing } = await admin
        .from("cnpjs")
        .select("*")
        .eq("user_id", userId)
        .eq("cnpj", cnpj)
        .maybeSingle();

      if (!force && existing && existing.last_checked_at && existing.last_checked_at > cutoff) {
        results.push({ cnpj, status: "cached", changed: false, data: existing });
        continue;
      }

      const { data, error } = await fetchCNPJData(cnpj);
      if (error || !data) {
        results.push({ cnpj, status: "error", error: error || "unknown" });
        continue;
      }

      // Detect changes vs existing
      const changes: Array<{ field: string; old: string | null; new: string | null }> = [];
      if (existing) {
        for (const f of TRACKED_FIELDS) {
          const oldV = (existing as any)[f];
          const newV = (data as any)[f];
          const oldS = oldV === null || oldV === undefined ? null : String(oldV);
          const newS = newV === null || newV === undefined ? null : String(newV);
          if (oldS !== newS) changes.push({ field: f, old: oldS, new: newS });
        }
      }

      const payload = {
        user_id: userId,
        cnpj,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        simples_nacional: data.simples_nacional,
        regime_tributario: data.regime_tributario,
        status_cadastral: data.status_cadastral,
        data_inicio_regime: data.data_inicio_regime,
        porte: data.porte,
        municipio: data.municipio,
        uf: data.uf,
        last_checked_at: new Date().toISOString(),
      };

      let cnpjId = existing?.id;
      if (existing) {
        await admin.from("cnpjs").update(payload).eq("id", existing.id);
      } else {
        const { data: ins } = await admin.from("cnpjs").insert(payload).select("id").single();
        cnpjId = ins?.id;
      }

      if (changes.length && cnpjId) {
        await admin.from("cnpj_history").insert(
          changes.map((c) => ({
            cnpj_id: cnpjId,
            user_id: userId,
            field_changed: c.field,
            old_value: c.old,
            new_value: c.new,
          }))
        );
      }

      results.push({
        cnpj,
        status: existing ? "updated" : "created",
        changed: changes.length > 0,
        changes,
        source: data.source,
        data: { ...payload, id: cnpjId },
      });
    }

    // Registra uso real após as consultas
    const successCount = results.filter(r => r.status !== "error").length;
    if (successCount > 0) {
      await admin.from("usage_logs").insert({ user_id: userId, action: "consulta_cnpj", quantity: successCount });
    }

    const summary = {
      total: results.length,
      success: results.filter((r) => r.status !== "error").length,
      errors: results.filter((r) => r.status === "error").length,
      changed: results.filter((r) => r.changed).length,
    };

    return new Response(JSON.stringify({ results, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("consulta-cnpj error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
