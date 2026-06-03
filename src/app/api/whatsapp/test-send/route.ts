// Endpoint ADMIN: dispara um template NOVO sob demanda (ignora o dedup), para testar.
// Protegido pelo verify token. Pode ser removido depois de validar o fluxo.
//   GET /api/whatsapp/test-send?token=<WHATSAPP_VERIFY_TOKEN>&to=<NUMERO>&nome=<opcional>
import { canSend, isAllowed, waConfig } from "@/lib/whatsapp/config";
import { sendMessage } from "@/lib/whatsapp/client";
import { normalizePhoneBR, isValidPhoneBR } from "@/lib/whatsapp/send-template";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!waConfig.verifyToken || url.searchParams.get("token") !== waConfig.verifyToken) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }
  const toRaw = url.searchParams.get("to");
  if (!toRaw) return Response.json({ error: "passe ?to=NUMERO" }, { status: 400 });

  const to = normalizePhoneBR(toRaw);
  if (!isValidPhoneBR(to)) return Response.json({ error: "telefone inválido", to }, { status: 400 });

  const gate = canSend();
  if (!gate.ok) return Response.json({ error: gate.reason, to }, { status: 400 });
  if (!isAllowed(to)) return Response.json({ error: "fora da allowlist", to }, { status: 400 });

  const nome = url.searchParams.get("nome") ?? "teste";
  const res = await sendMessage({
    to: to.replace("+", ""),
    type: "template",
    template: {
      name: waConfig.templateName,
      language: { code: waConfig.templateLang },
      components: [{ type: "body", parameters: [{ type: "text", text: nome }] }],
    },
  });

  return Response.json({ to, sent: res.ok, status: res.status, body: res.body });
}
