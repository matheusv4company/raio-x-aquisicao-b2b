# Raio-X da Aquisição B2B

Lead magnet web: o empresário B2B preenche um diagnóstico e recebe um **plano
personalizado de captação de clientes** — canal recomendado (Google × Meta),
estrutura de campanha e criativos, CPL esperado, metas de funil e unit economics —
entregue em **PDF pelo WhatsApp**.

## Stack
- **Next.js 16** (App Router) + **TypeScript** + **Tailwind v4**
- **Engine de recomendação desacoplada** (`src/lib/engine`) com 5 arquétipos de decisão de canal
- **PDF** via `@react-pdf/renderer`
- **Persistência:** Postgres (Prisma) — _em construção_
- **WhatsApp Cloud API** (template com botões + webhook + janela de 24h) — _em construção_

## Rodando localmente
```bash
npm install
npm run dev
# abra http://localhost:3000/diagnostico
```

## Rotas
- `/diagnostico` — formulário do diagnóstico
- `POST /api/diagnostico` — submissão (valida → engine → dispara WhatsApp)
- `GET|POST /api/engine/run` — inspeção da engine (todos os intermediários, para refino)
- `GET|POST /api/pdf` — gera o PDF da análise

## Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha. Sem credenciais, o app roda em
**modo fallback** (engine com heurística, WhatsApp em stub). Veja `.env.example` para a lista.

## Engine — arquétipos de decisão de canal
A IA lê a **oferta** e classifica em um arquétipo (o canal vem da oferta, não do segmento):
`A1` Necessidade aguda · `A2` Insatisfação percebida · `A3` Desejo pré-existente → **Google**;
`A4` Acomodação/insatisfação latente · `A5` Oferta diferenciada → **Meta**.
Cada step é independente e refinável (`src/lib/engine/steps`); providers (Claude, Google Ads) são injetáveis.

## Status
F0–F2 ✅ scaffold · formulário · engine + benchmarks · F4 ✅ submissão + confirmação · F5 ✅ PDF.
Em construção: persistência (Postgres), WhatsApp (template + webhook), deploy.
