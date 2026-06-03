import postgres from "postgres";

// Cliente Postgres (postgres.js) — singleton, serverless-friendly (1 conexão por instância).
// Sem DATABASE_URL → sql = null e o app degrada graciosamente (persistência desativada).

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __raioxSql: Sql | null | undefined;
}

function createClient(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const ssl = process.env.DATABASE_SSL === "disable" ? false : "require";
  // prepare:false => compatível com poolers em modo transaction (PgBouncer/Neon/Supabase).
  return postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 10, ssl, prepare: false });
}

export const sql: Sql | null =
  globalThis.__raioxSql !== undefined ? globalThis.__raioxSql : createClient();

if (process.env.NODE_ENV !== "production") globalThis.__raioxSql = sql;

export const dbEnabled = sql !== null;

let schemaReady = false;

/** Cria a tabela se não existir (idempotente, não destrutivo). */
export async function ensureSchema(): Promise<void> {
  if (!sql || schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id                   text PRIMARY KEY,
      created_at           timestamptz NOT NULL DEFAULT now(),
      nome                 text NOT NULL,
      email                text NOT NULL,
      telefone             text NOT NULL,
      channel              text NOT NULL,
      archetype            text NOT NULL,
      result               jsonb NOT NULL,
      wa_status            text NOT NULL DEFAULT 'pending',
      wa_template_sent_at  timestamptz,
      wa_opt_in_at         timestamptz,
      wa_pdf_sent_at       timestamptz
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS submissions_telefone_idx ON submissions (telefone)`;
  schemaReady = true;
}
