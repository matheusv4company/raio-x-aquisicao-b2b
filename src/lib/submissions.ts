// Acesso à tabela submissions. Todas as funções degradam para no-op/null se não houver DB.
import { sql, ensureSchema } from "@/lib/db";
import type { DiagnosticInput } from "@/lib/diagnostic";
import type { EngineRun } from "@/lib/engine/types";

export interface SubmissionRow {
  id: string;
  nome: string;
  telefone: string;
  channel: string;
  archetype: string;
  result: EngineRun; // EngineRun completo (input + plano) — usado para gerar o PDF
  wa_status: string;
  wa_pdf_sent_at: string | null;
}

export async function saveSubmission(
  id: string,
  input: DiagnosticInput,
  telefone: string,
  run: EngineRun,
): Promise<boolean> {
  if (!sql) return false;
  await ensureSchema();
  await sql`INSERT INTO submissions ${sql({
    id,
    nome: input.nome,
    email: input.email,
    telefone,
    channel: run.plan.channel,
    archetype: run.plan.decision.archetype,
    result: sql.json(JSON.parse(JSON.stringify(run))),
    wa_status: "pending",
  })}`;
  return true;
}

/** Armazena os bytes do PDF pré-gerado (best-effort). */
export async function savePdf(id: string, pdf: Buffer): Promise<void> {
  if (!sql) return;
  await ensureSchema();
  await sql`UPDATE submissions SET pdf = ${pdf}, pdf_generated_at = now() WHERE id = ${id}`;
}

/** Lê os bytes do PDF pré-gerado, se já existir. */
export async function getPdfBytes(id: string): Promise<Buffer | null> {
  if (!sql) return null;
  await ensureSchema();
  const rows = await sql<{ pdf: Buffer | null }[]>`
    SELECT pdf FROM submissions WHERE id = ${id} LIMIT 1
  `;
  const pdf = rows[0]?.pdf;
  return pdf && pdf.length > 0 ? pdf : null;
}

/** Dedup: já enviamos um template para este telefone nos últimos N segundos? */
export async function wasTemplateSentToPhoneRecently(
  telefone: string,
  withinSeconds: number,
): Promise<boolean> {
  if (!sql) return false;
  await ensureSchema();
  const rows = await sql`
    SELECT 1 FROM submissions
    WHERE telefone = ${telefone}
      AND wa_template_sent_at IS NOT NULL
      AND wa_template_sent_at > now() - make_interval(secs => ${withinSeconds})
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function markTemplateSent(id: string): Promise<void> {
  if (!sql) return;
  await sql`UPDATE submissions SET wa_template_sent_at = now(), wa_status = 'template_sent' WHERE id = ${id}`;
}

export async function findById(id: string): Promise<SubmissionRow | null> {
  if (!sql) return null;
  await ensureSchema();
  const rows = await sql<SubmissionRow[]>`
    SELECT id, nome, telefone, channel, archetype, result, wa_status, wa_pdf_sent_at
    FROM submissions WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Webhook: encontra a submissão mais recente de um telefone (o que clicou no botão). */
export async function findLatestByPhone(telefone: string): Promise<SubmissionRow | null> {
  if (!sql) return null;
  await ensureSchema();
  const rows = await sql<SubmissionRow[]>`
    SELECT id, nome, telefone, channel, archetype, result, wa_status, wa_pdf_sent_at
    FROM submissions WHERE telefone = ${telefone} ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function markOptIn(id: string): Promise<void> {
  if (!sql) return;
  await sql`UPDATE submissions SET wa_opt_in_at = now(), wa_status = 'opted_in' WHERE id = ${id}`;
}

export async function markPdfSent(id: string): Promise<void> {
  if (!sql) return;
  await sql`UPDATE submissions SET wa_pdf_sent_at = now(), wa_status = 'pdf_sent' WHERE id = ${id}`;
}

export async function markDeclined(id: string): Promise<void> {
  if (!sql) return;
  await sql`UPDATE submissions SET wa_status = 'declined' WHERE id = ${id}`;
}
