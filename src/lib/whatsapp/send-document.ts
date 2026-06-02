// Envia o PDF como documento — usado pelo webhook, DENTRO da janela de 24h (mensagem livre).
// Passa pelas travas (kill switch + allowlist). SEM retry.
import { canSend, isAllowed } from "@/lib/whatsapp/config";
import { sendMessage } from "@/lib/whatsapp/client";

export interface DocResult {
  sent: boolean;
  skipped?: string;
  status?: number;
  error?: unknown;
}

export async function sendDocument(
  toE164: string,
  link: string,
  filename: string,
  caption?: string,
): Promise<DocResult> {
  const gate = canSend();
  if (!gate.ok) {
    console.log(`[whatsapp] documento NÃO enviado (${gate.reason}) — ${toE164}`);
    return { sent: false, skipped: gate.reason };
  }
  if (!isAllowed(toE164)) {
    console.log(`[whatsapp] documento: ${toE164} fora da allowlist`);
    return { sent: false, skipped: "fora da allowlist" };
  }

  const res = await sendMessage({
    to: toE164.replace("+", ""),
    type: "document",
    document: { link, filename, caption },
  });

  if (!res.ok) {
    console.error(`[whatsapp] erro ao enviar documento a ${toE164}:`, res.status, res.body);
    return { sent: false, status: res.status, error: res.body };
  }
  return { sent: true, status: res.status };
}
