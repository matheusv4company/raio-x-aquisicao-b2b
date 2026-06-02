// Cliente de baixo nível da Graph API (Cloud API). Timeout curto, SEM retry (proteção da conta).
import { WA_API_VERSION, waConfig } from "@/lib/whatsapp/config";

const GRAPH = "https://graph.facebook.com";

export interface SendApiResult {
  ok: boolean;
  status: number;
  body: unknown;
}

export async function sendMessage(payload: Record<string, unknown>): Promise<SendApiResult> {
  const url = `${GRAPH}/${WA_API_VERSION}/${waConfig.phoneNumberId}/messages`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waConfig.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
      signal: controller.signal,
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: { error: String(err) } };
  } finally {
    clearTimeout(timer);
  }
}
