// Geração do PDF da análise. GET = exemplo embutido; POST = input validado.
// Mais tarde (Fase 6) o WhatsApp aponta para /api/pdf/[id] gerando a partir do Submission salvo.
import { diagnosticSchema, type DiagnosticInput } from "@/lib/diagnostic";
import { runEngine } from "@/lib/engine/engine";
import { renderAnalysisPdf } from "@/lib/pdf/render";

// Chromium headless precisa do runtime Node e de mais tempo que o padrão.
export const runtime = "nodejs";
export const maxDuration = 60;

const SAMPLE: DiagnosticInput = {
  segmento: "Médico oftalmologista",
  faturamento: "250-500k",
  produtoPrincipal: "cirurgia de catarata",
  ticketMedio: "5-10k",
  recorrencia: "pontual",
  metaCrescimento: "forte",
  vendedores: "1-3",
  trafego: "nao",
  oferta:
    "Cirurgia de catarata com lente premium para pacientes acima de 55 anos que querem voltar a enxergar sem óculos, com avaliação pré-operatória completa e acompanhamento.",
  nome: "Exemplo",
  email: "exemplo@empresa.com.br",
  telefone: "11999999999",
  consentimento: true,
};

function pdfResponse(buf: Buffer, filename: string): Response {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const run = await runEngine(SAMPLE);
  const pdf = await renderAnalysisPdf(run);
  return pdfResponse(pdf, "raio-x-exemplo.pdf");
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
  const pdf = await renderAnalysisPdf(run);
  return pdfResponse(pdf, "raio-x-da-aquisicao.pdf");
}
