// Submissão do diagnóstico: valida → roda a engine → salva o lead → dispara o template do
// WhatsApp (com travas/dedup; OFF por padrão). Persistência e WhatsApp são best-effort: um erro
// neles NÃO quebra a confirmação para o usuário.
import { randomUUID } from "node:crypto";
import { diagnosticSchema } from "@/lib/diagnostic";
import { runEngine } from "@/lib/engine/engine";
import {
  saveSubmission,
  savePdf,
  markTemplateSent,
  wasTemplateSentToPhoneRecently,
} from "@/lib/submissions";
import { renderAnalysisPdf } from "@/lib/pdf/render";
import { DEDUP_WINDOW_SECONDS } from "@/lib/whatsapp/config";
import {
  sendDiagnosticReadyTemplate,
  normalizePhoneBR,
} from "@/lib/whatsapp/send-template";

// Gera o PDF (Chromium) já no submit → runtime Node e mais tempo que o padrão.
export const runtime = "nodejs";
export const maxDuration = 60;

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

  // Dedup: se já enviamos um template a esse número há pouco, bloqueia o reenvio.
  // Curto-circuito ANTES de rodar a engine/PDF — economiza compute e sinaliza a UI (429).
  if (DEDUP_WINDOW_SECONDS > 0) {
    try {
      if (await wasTemplateSentToPhoneRecently(telefone, DEDUP_WINDOW_SECONDS)) {
        return Response.json(
          {
            ok: false,
            error: "dedup",
            retryAfterMinutes: Math.ceil(DEDUP_WINDOW_SECONDS / 60),
          },
          { status: 429 },
        );
      }
    } catch (err) {
      console.error("[/api/diagnostico] erro no check de dedup:", err);
      // erro de DB não bloqueia o fluxo
    }
  }

  try {
    const run = await runEngine(input);
    const id = randomUUID();

    // Persistência (best-effort — não derruba a confirmação se o DB estiver fora).
    let saved = false;
    try {
      saved = await saveSubmission(id, input, telefone, run);
    } catch (err) {
      console.error("[/api/diagnostico] falha ao salvar:", err);
    }

    // Pré-gera o PDF e guarda os bytes — assim o link do WhatsApp serve algo pronto
    // (sem cold start do Chromium no fetch da Meta). Fallback: /api/pdf/[id] gera on-demand.
    if (saved) {
      try {
        const pdf = await renderAnalysisPdf(run);
        await savePdf(id, pdf);
      } catch (err) {
        console.error("[/api/diagnostico] falha ao pré-gerar PDF:", err);
      }
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
