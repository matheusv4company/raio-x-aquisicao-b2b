// Rota de DEV/inspeção da engine — retorna TODOS os intermediários (palavras-chave →
// demanda → decisão → estrutura → CPL → funil), para refinar cada step isoladamente.
// GET  /api/engine/run        → roda um exemplo embutido
// POST /api/engine/run {input}→ roda com input validado pelo diagnosticSchema
import { diagnosticSchema, type DiagnosticInput } from "@/lib/diagnostic";
import { runEngine } from "@/lib/engine/engine";

const SAMPLE: DiagnosticInput = {
  segmento: "Médico oftalmologista",
  faturamento: "250-500k",
  produtoPrincipal: "cirurgia de catarata",
  ticketMedio: "5-10k",
  recorrencia: "pontual",
  vendedores: "1-3",
  trafego: "nao",
  oferta:
    "Cirurgia de catarata com lente premium para pacientes acima de 55 anos que querem voltar a enxergar sem óculos, com avaliação pré-operatória completa e acompanhamento.",
  nome: "Exemplo",
  email: "exemplo@empresa.com.br",
  telefone: "11999999999",
  consentimento: true,
};

export async function GET() {
  const run = await runEngine(SAMPLE);
  return Response.json(run);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = diagnosticSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validação falhou", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const run = await runEngine(parsed.data);
  return Response.json(run);
}
