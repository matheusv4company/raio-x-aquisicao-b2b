// Envia o template "sua análise está pronta" (com 2 quick-reply buttons) para o lead.
// Passa por TODAS as travas: validação, kill switch, allowlist, dedup. SEM retry.
import {
  canSend,
  isAllowed,
  waConfig,
  DEDUP_WINDOW_SECONDS,
} from "@/lib/whatsapp/config";
import { sendMessage } from "@/lib/whatsapp/client";
import { wasTemplateSentToPhoneRecently } from "@/lib/submissions";

export interface SendResult {
  sent: boolean;
  skipped?: string;
  status?: number;
  error?: unknown;
  to: string;
}

/** Normaliza telefone BR para E.164 (+55DDDNÚMERO). */
export function normalizePhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

/** +55 + DDD(2) + número(8 ou 9) = 12 ou 13 dígitos. */
export function isValidPhoneBR(e164: string): boolean {
  const d = e164.replace(/\D/g, "");
  return d.startsWith("55") && (d.length === 12 || d.length === 13);
}

export async function sendDiagnosticReadyTemplate(
  toE164: string,
  firstName: string,
): Promise<SendResult> {
  const to = toE164;

  // 1) Telefone válido (número inválido derruba o quality rating)
  if (!isValidPhoneBR(to)) return { sent: false, skipped: "telefone inválido", to };

  // 2) Kill switch + credenciais
  const gate = canSend();
  if (!gate.ok) {
    console.log(`[whatsapp] NÃO enviado (${gate.reason}) — ${to}`);
    return { sent: false, skipped: gate.reason, to };
  }

  // 3) Allowlist (modo de teste: só números aprovados)
  if (!isAllowed(to)) {
    console.log(`[whatsapp] ${to} fora da allowlist — não enviado`);
    return { sent: false, skipped: "fora da allowlist", to };
  }

  // 4) Dedup (1 template por telefone na janela)
  if (await wasTemplateSentToPhoneRecently(to, DEDUP_WINDOW_SECONDS)) {
    console.log(`[whatsapp] dedup — template já enviado a ${to} recentemente`);
    return { sent: false, skipped: "dedup", to };
  }

  // 5) Envio (sem retry). Template com 1 variável no corpo ({{1}} = primeiro nome) + 2 quick-reply buttons.
  const res = await sendMessage({
    to: to.replace("+", ""),
    type: "template",
    template: {
      name: waConfig.templateName,
      language: { code: waConfig.templateLang },
      components: [
        { type: "body", parameters: [{ type: "text", text: firstName || "tudo bem" }] },
      ],
    },
  });

  if (!res.ok) {
    console.error(`[whatsapp] erro ao enviar template a ${to}:`, res.status, res.body);
    return { sent: false, status: res.status, error: res.body, to };
  }
  return { sent: true, status: res.status, to };
}
