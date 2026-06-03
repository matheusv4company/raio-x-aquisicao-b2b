// PDF de uma submissão específica (gerado a partir do EngineRun salvo). É o link enviado no WhatsApp.
// id = UUID (não enumerável). Sem DB ou id inexistente → 404.
import { findById, getPdfBytes, savePdf } from "@/lib/submissions";
import { renderAnalysisPdf } from "@/lib/pdf/render";

// Fallback on-demand precisa do runtime Node e de mais tempo que o padrão.
export const runtime = "nodejs";
export const maxDuration = 60;

function pdfResponse(buf: Buffer): Response {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="raio-x-da-aquisicao.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Caminho rápido: PDF pré-gerado no submit (sem cold start do Chromium aqui).
  const stored = await getPdfBytes(id);
  if (stored) return pdfResponse(stored);

  // Fallback: gera on-demand a partir do EngineRun salvo e guarda para a próxima.
  const row = await findById(id);
  if (!row) return new Response("Não encontrado", { status: 404 });

  const pdf = await renderAnalysisPdf(row.result);
  try {
    await savePdf(id, pdf);
  } catch {
    /* ignore — segue servindo o que gerou */
  }
  return pdfResponse(pdf);
}
