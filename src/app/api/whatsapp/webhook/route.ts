/* eslint-disable @typescript-eslint/no-explicit-any */
// Webhook do WhatsApp Cloud API.
// GET  = verificação (hub.verify_token).
// POST = eventos. Verifica a ASSINATURA (X-Hub-Signature-256) antes de processar; ao receber
//        o clique em "Quero receber agora", envia o PDF na janela de 24h. Tudo idempotente.
import { createHmac, timingSafeEqual } from "node:crypto";
import { waConfig } from "@/lib/whatsapp/config";
import {
  findLatestByPhone,
  markOptIn,
  markPdfSent,
  markDeclined,
} from "@/lib/submissions";
import { sendDocument } from "@/lib/whatsapp/send-document";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (
    mode === "subscribe" &&
    token &&
    waConfig.verifyToken &&
    token === waConfig.verifyToken
  ) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();

  // Verificação de assinatura — sem isso, qualquer POST forjado seria processado.
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  if (!verifySignature(raw, signature)) {
    console.warn("[whatsapp:webhook] assinatura inválida — ignorado");
    return new Response("invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  // Log diagnóstico do payload recebido (temporário — remover depois de validar).
  console.log("[whatsapp:webhook] in:", raw.slice(0, 1500));

  // Origem da requisição = domínio correto do app (robusto, sem depender de env var).
  const origin = new URL(request.url).origin;

  try {
    await handleEvent(payload, origin);
  } catch (err) {
    console.error("[whatsapp:webhook] erro ao processar:", err);
  }
  // Sempre 200 rápido (senão a Meta re-tenta e gera ruído).
  return new Response("ok", { status: 200 });
}

function verifySignature(raw: string, header: string): boolean {
  if (!waConfig.appSecret) return false; // sem app secret => rejeita tudo (seguro)
  if (!header.startsWith("sha256=")) return false;
  const expected =
    "sha256=" + createHmac("sha256", waConfig.appSecret).update(raw).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handleEvent(payload: any, origin: string): Promise<void> {
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      for (const msg of change?.value?.messages ?? []) {
        const from = msg?.from ? `+${String(msg.from).replace(/\D/g, "")}` : null;
        if (!from) continue;
        // Aceita o clique no quick-reply (button/interactive) E o texto digitado pelo lead
        // (muitos digitam "quero receber" em vez de tocar no botão).
        const text = (
          msg?.button?.text ??
          msg?.interactive?.button_reply?.title ??
          msg?.text?.body ??
          ""
        ).toString();
        if (text) await handleButton(from, text, origin);
      }
    }
  }
}

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

async function handleButton(
  fromE164: string,
  buttonText: string,
  origin: string,
): Promise<void> {
  const t = norm(buttonText);
  const recusar = t.includes("nao quero") || t.includes("nao receber");
  const receber = !recusar && t.includes("receber");

  const row = await findLatestByPhone(fromE164);
  if (!row) {
    console.log(`[whatsapp:webhook] sem submissão para ${fromE164}`);
    return;
  }

  if (recusar) {
    await markDeclined(row.id);
    return;
  }
  if (!receber) {
    console.log(`[whatsapp:webhook] botão não reconhecido: "${buttonText}"`);
    return;
  }

  // Opt-in confirmado → janela de 24h aberta → enviar o PDF (idempotente).
  await markOptIn(row.id);
  if (row.wa_pdf_sent_at) {
    console.log(`[whatsapp:webhook] PDF já enviado para ${fromE164}`);
    return;
  }

  // Link do PDF montado a partir do host da requisição (sempre o domínio certo).
  const link = `${origin}/api/pdf/${row.id}`;
  const res = await sendDocument(
    fromE164,
    link,
    "raio-x-da-aquisicao.pdf",
    "Aqui está o seu Raio-X da Aquisição B2B 🚀",
  );
  if (res.sent) await markPdfSent(row.id);
}
