// Cria uma preferência de pagamento no Mercado Pago e retorna o link de checkout.
// Requer: MERCADO_PAGO_ACCESS_TOKEN configurado nos secrets do Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_ORIGINS = [
  "https://cnpjbrasiltrack.vercel.app",
  "https://cnpjtrack-sooty.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:5174",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const PLAN_PRICES: Record<string, { title: string; amount: number; currency_id: string }> = {
  Starter: { title: "CNPJTrack Starter", amount: 1.00, currency_id: "BRL" },
  Pro:     { title: "CNPJTrack Pro",     amount: 1.00, currency_id: "BRL" },
};

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: "origin not allowed" }), { status: 403, headers: cors });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

  if (!mpToken) {
    return new Response(JSON.stringify({ error: "MP not configured" }), { status: 500, headers: cors });
  }

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: userResp, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userResp.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });
  }
  const userId = userResp.user.id;
  const userEmail = userResp.user.email!;

  const { plan_name } = await req.json().catch(() => ({}));
  const planInfo = PLAN_PRICES[plan_name];
  if (!planInfo) {
    return new Response(JSON.stringify({ error: "Plano inválido" }), { status: 400, headers: cors });
  }

  const { data: planRow } = await admin.from("plans").select("id").eq("name", plan_name).single();
  if (!planRow) {
    return new Response(JSON.stringify({ error: "Plano não encontrado" }), { status: 400, headers: cors });
  }

  // Cria preferência no Mercado Pago
  const preference = {
    items: [{ title: planInfo.title, quantity: 1, unit_price: planInfo.amount, currency_id: planInfo.currency_id }],
    payer: { email: userEmail },
    external_reference: `${userId}|${plan_name}`,
    back_urls: {
      success: `${ALLOWED_ORIGINS[0]}/planos?mp=success`,
      failure: `${ALLOWED_ORIGINS[0]}/planos?mp=failure`,
      pending: `${ALLOWED_ORIGINS[0]}/planos?mp=pending`,
    },
    auto_return: "approved",
    notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
    expires: false,
  };

  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${mpToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(preference),
  });

  if (!mpRes.ok) {
    const err = await mpRes.text();
    return new Response(JSON.stringify({ error: "Erro ao criar preferência MP", detail: err }), { status: 500, headers: cors });
  }

  const mpData = await mpRes.json();

  // Registra a assinatura pendente no banco
  await admin.from("subscriptions").insert({
    user_id: userId,
    plan_id: planRow.id,
    mp_preference_id: mpData.id,
    status: "pending",
    amount_cents: Math.round(planInfo.amount * 100),
  });

  return new Response(
    JSON.stringify({ init_point: mpData.init_point }),
    { headers: { ...cors, "Content-Type": "application/json" } }
  );
});
