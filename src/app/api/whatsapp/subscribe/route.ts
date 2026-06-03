// Endpoint ADMIN de uso único: inscreve o app na WABA (subscribed_apps) para receber webhooks.
// Necessário porque configurar o callback no app NÃO basta — o app precisa estar inscrito na WABA.
// Protegido pelo verify token. Pode ser removido depois de usar.
//   GET /api/whatsapp/subscribe?token=<WHATSAPP_VERIFY_TOKEN>&waba=<WABA_ID opcional>
import { WA_API_VERSION, waConfig } from "@/lib/whatsapp/config";

const GRAPH = "https://graph.facebook.com";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!waConfig.verifyToken || url.searchParams.get("token") !== waConfig.verifyToken) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }
  if (!waConfig.token) {
    return Response.json({ error: "WHATSAPP_ACCESS_TOKEN ausente" }, { status: 400 });
  }
  const headers = { Authorization: `Bearer ${waConfig.token}` };

  // Resolve a WABA: via ?waba= ou a partir do phone_number_id.
  let wabaId = url.searchParams.get("waba") ?? "";
  if (!wabaId && waConfig.phoneNumberId) {
    try {
      const res = await fetch(
        `${GRAPH}/${WA_API_VERSION}/${waConfig.phoneNumberId}?fields=whatsapp_business_account`,
        { headers },
      );
      const j = await res.json();
      wabaId = j?.whatsapp_business_account?.id ?? "";
    } catch {
      /* segue para erro abaixo */
    }
  }
  if (!wabaId) {
    return Response.json(
      { error: "WABA não resolvida — chame de novo com ?waba=ID_DA_WABA" },
      { status: 400 },
    );
  }

  // Inscreve o app (dono do token) na WABA.
  const subRes = await fetch(`${GRAPH}/${WA_API_VERSION}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers,
  });
  const subBody = await subRes.json().catch(() => ({}));

  // Confirma quais apps estão inscritos.
  const listRes = await fetch(`${GRAPH}/${WA_API_VERSION}/${wabaId}/subscribed_apps`, { headers });
  const listBody = await listRes.json().catch(() => ({}));

  return Response.json({
    wabaId,
    subscribe: { status: subRes.status, ok: subRes.ok, body: subBody },
    subscribedApps: listBody,
  });
}
