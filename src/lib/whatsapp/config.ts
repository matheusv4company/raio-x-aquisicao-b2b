// Configuração + TRAVAS DE SEGURANÇA do WhatsApp Cloud API. Tudo OFF por padrão.
export const WA_API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";

export const waConfig = {
  enabled: process.env.WHATSAPP_ENABLED === "true",
  token: process.env.WHATSAPP_ACCESS_TOKEN || "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  templateName: process.env.WHATSAPP_TEMPLATE_NAME || "raio_x_resultado",
  templateLang: process.env.WHATSAPP_TEMPLATE_LANG || "pt_BR",
  appSecret: process.env.WHATSAPP_APP_SECRET || "",
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "",
  allowlist: (process.env.WHATSAPP_ALLOWLIST || "")
    .split(",")
    .map((s) => s.replace(/\D/g, ""))
    .filter(Boolean),
};

// Dedup: no máximo 1 template por telefone dentro desta janela (em segundos).
// Configurável via WHATSAPP_DEDUP_SECONDS. Default 15min. Defina 0 para DESATIVAR (ex.: testes).
const DEDUP_DEFAULT = 15 * 60;
export const DEDUP_WINDOW_SECONDS = (() => {
  const v = process.env.WHATSAPP_DEDUP_SECONDS;
  if (v === undefined || v.trim() === "") return DEDUP_DEFAULT;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : DEDUP_DEFAULT;
})();

/** Envio real habilitado? Precisa do kill switch ligado + credenciais presentes. */
export function canSend(): { ok: boolean; reason?: string } {
  if (!waConfig.enabled) return { ok: false, reason: "WHATSAPP_ENABLED!=true (kill switch desligado)" };
  if (!waConfig.token || !waConfig.phoneNumberId)
    return { ok: false, reason: "credenciais ausentes (token/phone_number_id)" };
  return { ok: true };
}

/**
 * Allowlist de segurança. SEGURO POR PADRÃO: se a allowlist estiver vazia e WHATSAPP_ALLOW_ALL
 * não for "true", NINGUÉM recebe — mesmo com o kill switch ligado. Para testar, ponha só o seu
 * número em WHATSAPP_ALLOWLIST. Para produção (liberar todos), defina WHATSAPP_ALLOW_ALL=true.
 */
export function isAllowed(e164: string): boolean {
  if (process.env.WHATSAPP_ALLOW_ALL === "true") return true;
  const digits = e164.replace(/\D/g, "");
  return waConfig.allowlist.includes(digits);
}
