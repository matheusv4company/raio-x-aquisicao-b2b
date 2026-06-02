// Submissão do diagnóstico: valida → roda a engine → salva o lead → dispara o template do
// WhatsApp (com travas/dedup; OFF por padrão). Persistência e WhatsApp são best-effort: um erro
// neles NÃO quebra a confirmação para o usuário.
import { randomUUID } from "node:crypto";
import { diagnosticSchema } from "@/lib/diagnostic";
import { runEngine } from "@/lib/engine/engine";
import { saveSubmission, markTemplateSent } from "@/lib/submissions";
import {
  sendDiagnosticReadyTemplate,
  normalizePhoneBR,
} from "@/lib/whatsapp/send-template";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = diagnosticSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validação falhou", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const telefone = normalizePhoneBR(input.telefone);

  try {
    const run = await runEngine(input);
    const id = randomUUID();

    // Persistência (best-effort — não derruba a confirmação se o DB estiver fora).
    try {
      await saveSubmission(id, input, telefone, run);
    } catch (err) {
      console.error("[/api/diagnostico] falha ao salvar:", err);
    }

    // WhatsApp (best-effort, com todas as travas; só envia de verdade se habilitado + allowlist).
    let whatsapp;
    try {
      whatsapp = await sendDiagnosticReadyTemplate(telefone, input.nome.split(" ")[0]);
      if (whatsapp.sent) {
        try {
          await markTemplateSent(id);
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      console.error("[/api/diagnostico] falha no WhatsApp:", err);
      whatsapp = { sent: false, error: String(err), to: telefone };
    }

    return Response.json({ ok: true, id, channel: run.plan.channel, whatsapp });
  } catch (err) {
    console.error("[/api/diagnostico] erro:", err);
    return Response.json({ error: "Erro ao processar o diagnóstico" }, { status: 500 });
  }
}
