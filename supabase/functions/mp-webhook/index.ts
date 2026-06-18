// Webhook do Mercado Pago — confirma pagamento e ativa o plano do usuário.
// Configurar no MP: Suas integrações → Notificações IPN → URL = <supabase_url>/functions/v1/mp-webhook
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  const cors = { "Content-Type": "application/json" };

  if (req.method === "GET") {
    // MP envia GET para verificar o endpoint
    return new Response("ok", { status: 200 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;
  const admin = createClient(supabaseUrl, serviceKey);

  let body: any = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const topic = body.type || new URL(req.url).searchParams.get("topic");
  const id = body.data?.id || new URL(req.url).searchParams.get("id");

  if (topic !== "payment" || !id) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  }

  // Busca detalhes do pagamento no MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${mpToken}` },
  });

  if (!mpRes.ok) {
    console.error("MP payment fetch error", await mpRes.text());
    return new Response(JSON.stringify({ error: "mp fetch failed" }), { status: 200, headers: cors });
  }

  const payment = await mpRes.json();
  const status = payment.status; // approved | pending | rejected | cancelled
  const externalRef: string = payment.external_reference || "";
  const [userId, planName] = externalRef.split("|");

  if (!userId || !planName) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  }

  // Atualiza subscription no banco
  await admin.from("subscriptions")
    .update({ mp_payment_id: String(id), status, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "pending");

  if (status === "approved") {
    const { data: planRow } = await admin.from("plans").select("id").eq("name", planName).single();
    if (planRow) {
      // Ativa o plano por 30 dias
      const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      await admin.from("user_plans").upsert({
        user_id: userId,
        plan_id: planRow.id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      await admin.from("subscriptions")
        .update({ expires_at: periodEnd })
        .eq("user_id", userId)
        .eq("mp_payment_id", String(id));
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
});
