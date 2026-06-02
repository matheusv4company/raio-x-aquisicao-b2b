// Disparo do template "sua análise está pronta" (com 2 quick-reply buttons) para o lead.
// STUB até credenciais + template aprovado pela Meta (Fase 6). Contrato estável: a Fase 6
// só implementa a chamada real à Cloud API por baixo desta mesma função.
import type { DiagnosticInput } from "@/lib/diagnostic";

export interface SendTemplateResult {
  sent: boolean;
  stubbed: boolean;
  to: string;
  detail?: string;
}

/** Normaliza telefone BR para E.164 (+55DDDNÚMERO). */
export function normalizePhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

export async function sendDiagnosticReadyTemplate(
  input: DiagnosticInput,
): Promise<SendTemplateResult> {
  const to = normalizePhoneBR(input.telefone);

  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log(
      `[whatsapp:stub] enviaria o template "análise pronta" (com botões) para ${to} — ${input.nome}`,
    );
    return { sent: false, stubbed: true, to, detail: "stub (sem credenciais)" };
  }

  // TODO(Fase 6): chamada real à Cloud API — template utility/marketing com 2 quick-reply buttons
  // [Quero receber agora] / [Não quero receber]. O clique abre a janela de 24h (via webhook).
  return { sent: false, stubbed: true, to, detail: "envio real ainda não implementado (Fase 6)" };
}
