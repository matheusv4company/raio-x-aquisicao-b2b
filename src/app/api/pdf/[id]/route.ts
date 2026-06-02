// PDF de uma submissão específica (gerado a partir do EngineRun salvo). É o link enviado no WhatsApp.
// id = UUID (não enumerável). Sem DB ou id inexistente → 404.
import { findById } from "@/lib/submissions";
import { renderAnalysisPdf } from "@/lib/pdf/analysis-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const row = await findById(id);
  if (!row) return new Response("Não encontrado", { status: 404 });

  const pdf = await renderAnalysisPdf(row.result);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="raio-x-da-aquisicao.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
