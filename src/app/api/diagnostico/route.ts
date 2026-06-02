// Submissão do diagnóstico: valida → roda a engine → (persiste no DB: Fase 3) →
// dispara o template do WhatsApp (stub até Fase 6). Retorna ok para a tela de confirmação.
import { diagnosticSchema } from "@/lib/diagnostic";
import { runEngine } from "@/lib/engine/engine";
import { sendDiagnosticReadyTemplate } from "@/lib/whatsapp/send-template";

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

  try {
    // Calcula o plano (será persistido na Fase 3 e virará o PDF na Fase 5).
    const run = await runEngine(input);

    // TODO(Fase 3): salvar Submission(input + run.plan + status) no Postgres.

    // Dispara o template do WhatsApp (stub até Fase 6).
    const whatsapp = await sendDiagnosticReadyTemplate(input);

    return Response.json({ ok: true, channel: run.plan.channel, whatsapp });
  } catch (err) {
    console.error("[/api/diagnostico] erro:", err);
    return Response.json({ error: "Erro ao processar o diagnóstico" }, { status: 500 });
  }
}
