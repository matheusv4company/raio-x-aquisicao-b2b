-- Schema do Raio-X (Postgres). Criado automaticamente via ensureSchema() (CREATE IF NOT EXISTS,
-- não destrutivo). Este arquivo é referência / execução manual, se preferir.

CREATE TABLE IF NOT EXISTS submissions (
  id                   text PRIMARY KEY,
  created_at           timestamptz NOT NULL DEFAULT now(),
  nome                 text NOT NULL,
  email                text NOT NULL,
  telefone             text NOT NULL,          -- E.164 (+55...)
  channel              text NOT NULL,          -- google | meta
  archetype            text NOT NULL,          -- A1..A5
  result               jsonb NOT NULL,         -- EngineRun completo (input + plano) -> gera o PDF
  wa_status            text NOT NULL DEFAULT 'pending',
  wa_template_sent_at  timestamptz,
  wa_opt_in_at         timestamptz,
  wa_pdf_sent_at       timestamptz
);

CREATE INDEX IF NOT EXISTS submissions_telefone_idx ON submissions (telefone);
