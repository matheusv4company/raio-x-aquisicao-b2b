// PDF da análise (o entregável que o lead recebe no WhatsApp).
// Usa @react-pdf/renderer (server-side, sem headless Chrome). Fonte Helvetica padrão
// cobre acentos PT-BR (WinAnsi). Evitamos emojis/setas (não existem em Helvetica).
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { EngineRun, UnitEconomics } from "@/lib/engine/types";
import { FATURAMENTO, TICKET, RECORRENCIA } from "@/lib/diagnostic";

const C = {
  ink: "#18181b",
  muted: "#71717a",
  line: "#e4e4e7",
  soft: "#f4f4f5",
  white: "#ffffff",
  google: "#1a73e8",
  meta: "#0866ff",
  ok: "#059669",
  warn: "#b45309",
  bad: "#dc2626",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 10,
    color: C.ink,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: C.muted, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 4 },
  sub: { fontSize: 10, color: C.muted, marginTop: 2 },
  bizRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 10,
  },
  bizItem: { width: "50%", marginBottom: 8 },
  bizLabel: { fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  bizValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 1 },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  channelBox: { marginTop: 4, borderRadius: 8, padding: 16, backgroundColor: C.soft, borderLeftWidth: 4 },
  channelLabel: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  rationale: { fontSize: 10.5, color: C.ink, marginTop: 6, lineHeight: 1.55 },
  resumo: { marginBottom: 6 },
  bullet: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { width: 12, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1 },
  bigNumber: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  caption: { fontSize: 8, color: C.muted, marginTop: 2 },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingVertical: 5,
  },
  metricValue: { fontFamily: "Helvetica-Bold" },
  ueGrid: { flexDirection: "row", marginTop: 8 },
  ueCard: { flex: 1, padding: 10, backgroundColor: C.soft, borderRadius: 6, marginRight: 6 },
  ueNum: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  ueCap: { fontSize: 8, color: C.muted, marginTop: 2 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    marginTop: 10,
  },
  comment: { fontSize: 10, color: C.ink, marginTop: 8, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.muted,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
  },
});

const VERDICT_COLOR: Record<UnitEconomics["veredito"], string> = {
  "saudável": C.ok,
  "atenção": C.warn,
  "inviável": C.bad,
};

function labelOf(opts: readonly { value: string; label: string }[], v: string): string {
  return opts.find((o) => o.value === v)?.label ?? v;
}

function brl(n: number): string {
  return "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>Raio-X da Aquisição B2B</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function AnalysisDocument({ run }: { run: EngineRun }) {
  const { input, plan, decision, mediaPlan, cpl, funnel } = run;
  const ue = funnel.unitEconomics;
  const channelLabel = plan.channel === "google" ? "Google Ads" : "Meta Ads";
  const accent = plan.channel === "google" ? C.google : C.meta;

  return (
    <Document title="Raio-X da Aquisição B2B" author="Raio-X da Aquisição B2B">
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>RAIO-X DA AQUISIÇÃO B2B</Text>
        <Text style={styles.h1}>Seu plano de captação de clientes</Text>
        <Text style={styles.sub}>Análise personalizada para {input.segmento}</Text>

        <View style={styles.bizRow}>
          <View style={styles.bizItem}>
            <Text style={styles.bizLabel}>Produto principal</Text>
            <Text style={styles.bizValue}>{input.produtoPrincipal}</Text>
          </View>
          <View style={styles.bizItem}>
            <Text style={styles.bizLabel}>Faturamento</Text>
            <Text style={styles.bizValue}>{labelOf(FATURAMENTO, input.faturamento)}</Text>
          </View>
          <View style={styles.bizItem}>
            <Text style={styles.bizLabel}>Ticket médio</Text>
            <Text style={styles.bizValue}>{labelOf(TICKET, input.ticketMedio)}</Text>
          </View>
          <View style={styles.bizItem}>
            <Text style={styles.bizLabel}>Cobrança</Text>
            <Text style={styles.bizValue}>{labelOf(RECORRENCIA, input.recorrencia)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canal recomendado</Text>
          <View style={[styles.channelBox, { borderLeftColor: accent }]}>
            <Text style={[styles.channelLabel, { color: accent }]}>{channelLabel}</Text>
            <Text style={styles.rationale}>{decision.rationale}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estrutura de campanha</Text>
          <Text style={styles.resumo}>{mediaPlan.resumo}</Text>
          {mediaPlan.estrutura.map((e, i) => (
            <Bullet key={i}>{e}</Bullet>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ângulos de criativo</Text>
          {mediaPlan.criativos.map((c, i) => (
            <Bullet key={i}>{c}</Bullet>
          ))}
        </View>

        <Footer />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>RAIO-X DA AQUISIÇÃO B2B</Text>
        <Text style={styles.h1}>Suas metas e a conta da operação</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CPL esperado ({channelLabel})</Text>
          <Text style={styles.bigNumber}>
            {brl(cpl.min)} – {brl(cpl.max)}
          </Text>
          <Text style={styles.caption}>por lead{cpl.note ? `  •  ${cpl.note}` : ""}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metas de funil</Text>
          <Metric label="Conversão do anúncio/página em lead" value={`${funnel.lpConversion}%`} />
          <Metric label="Lead para lead qualificado" value={`${funnel.leadToQualified}%`} />
          <Metric label="Qualificado para reunião realizada" value={`${funnel.qualifiedToMeeting}%`} />
          <Metric label="Reunião para venda" value={`${funnel.meetingToSale}%`} />
          <Metric label="No-show de reuniões (máximo)" value={`${funnel.noShow}%`} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A conta fecha?</Text>
          <View style={styles.ueGrid}>
            <View style={styles.ueCard}>
              <Text style={styles.ueNum}>{ue.leadsPorVenda}</Text>
              <Text style={styles.ueCap}>leads por venda</Text>
            </View>
            <View style={styles.ueCard}>
              <Text style={styles.ueNum}>{ue.reunioesPorVenda}</Text>
              <Text style={styles.ueCap}>reuniões por venda</Text>
            </View>
            <View style={[styles.ueCard, { marginRight: 0 }]}>
              <Text style={styles.ueNum}>{brl(ue.cacImplicitoMedio)}</Text>
              <Text style={styles.ueCap}>CAC médio estimado</Text>
            </View>
          </View>
          <Text style={[styles.badge, { backgroundColor: VERDICT_COLOR[ue.veredito] }]}>
            {ue.veredito.toUpperCase()}
          </Text>
          <Text style={styles.comment}>{ue.comentario}</Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

export async function renderAnalysisPdf(run: EngineRun): Promise<Buffer> {
  return renderToBuffer(<AnalysisDocument run={run} />);
}
