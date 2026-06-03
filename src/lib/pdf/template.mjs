// Template HTML do PDF (fonte ÚNICA, usada pela produção E pelo preview local).
// JS puro, sem tipos/aliases, para poder ser importado por scripts .mjs e pelo bundler do Next.
// A PROJEÇÃO chega pronta em d.projection (calculada pela engine) — aqui só renderizamos.

export const C = {
  bg: "#f6f3ec", paper: "#fdfcf9", ink: "#1c1b18", inkSoft: "#5a564e", inkFaint: "#908b80",
  line: "#e4dfd3", lineSoft: "#eee9de", gold: "#b8893a", goldSoft: "#f0e4cc",
  blue: "#3f5c9e", blueSoft: "#e2e7f2", green: "#4a7a4e", greenSoft: "#e0ebe0",
  amber: "#c07a2c", amberSoft: "#f3e6d3", rose: "#a8504a", roseSoft: "#f0e0de",
};

export function brl(n) { return "R$ " + Math.round(n).toLocaleString("pt-BR"); }
export function brlK(n) { return n >= 1000 ? "R$ " + (Math.round(n / 100) / 10).toLocaleString("pt-BR") + "k" : brl(n); }
export function range(a, b) { return "R$ " + Math.round(a).toLocaleString("pt-BR") + "–" + Math.round(b).toLocaleString("pt-BR"); }

export function buildAnalysisHtml(d) {
  const accent = d.channel === "google" ? C.blue : C.gold;
  const accentSoft = d.channel === "google" ? C.blueSoft : C.goldSoft;
  const channelLabel = d.channel === "google" ? "Google Ads" : "Meta Ads";
  const f = d.funnel;
  const leadToSale = (f.leadToQualified / 100) * (f.qualifiedToMeeting / 100) * (f.meetingToSale / 100);
  const stages = [
    { name: "Leads gerados", pct: 100 },
    { name: "Leads qualificados", pct: Math.round(f.leadToQualified) },
    { name: "Reuniões realizadas", pct: Math.round(f.leadToQualified * f.qualifiedToMeeting / 100) },
    { name: "Vendas", pct: Math.round(leadToSale * 100) },
  ];
  const verdictColor = { "saudável": C.green, "atenção": C.amber, "inviável": C.rose }[d.ue.veredito] || C.green;

  const p = d.projection;
  const recorrente = d.input.recorrente;

  const head = (tag) => `<div class="head"><div class="brand"><div class="spark">◆</div>Raio-X da Aquisição B2B</div><div class="tag">${tag}</div></div>`;

  const execGoogle = `
    <div class="eyebrow">Como executar</div>
    <h2 class="sec-title">Seu plano no Google Ads</h2>
    <p class="sub">As palavras-chave certas e a estrutura para capturar quem já procura.</p>
    <div class="block-label">Palavras-chave para começar</div>
    <div class="chips">${d.keywords.map((k) => `<div class="chip kw"><span class="cd" style="background:${C.blue}"></span>${k}</div>`).join("")}</div>
    <div class="block-label" style="margin-top:22px">Estrutura da campanha</div>
    <div class="nodes">${d.estrutura.map((e, i) => `<div class="node"><div class="nn">${i + 1}</div><div class="nt">${e}</div></div>${i < d.estrutura.length - 1 ? '<div class="conn"></div>' : ""}`).join("")}</div>`;

  const execMeta = `
    <div class="eyebrow">Como executar</div>
    <h2 class="sec-title">Seu plano no Meta Ads</h2>
    <p class="sub">O formato de criativo certo e a estrutura para gerar atenção e demanda.</p>
    <div class="format-card">
      <div class="fmt-tipo">Formato recomendado: <b>${d.formato && d.formato.tipo === "video" ? "Vídeo" : "Criativos estáticos"}</b></div>
      <div class="fmt-motivo">${d.formato ? d.formato.motivo : ""}</div>
    </div>
    <div class="block-label" style="margin-top:22px">Estrutura da campanha</div>
    <div class="nodes">${d.estrutura.map((e, i) => `<div class="node"><div class="nn">${i + 1}</div><div class="nt">${e}</div></div>${i < d.estrutura.length - 1 ? '<div class="conn"></div>' : ""}`).join("")}</div>`;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,400;9..144,0,500;9..144,0,600;9..144,1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page{size:A4;margin:0}
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${C.bg};color:${C.ink};font-family:'Inter',sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}
  h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-.01em;line-height:1.12}
  .page{width:210mm;height:297mm;margin:0 auto;background:${C.bg};padding:46px 52px 58px;display:flex;flex-direction:column;page-break-after:always;position:relative;overflow:hidden}
  .page:last-child{page-break-after:auto}
  @media screen{.page+.page{margin-top:26px}}
  .head{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;margin-bottom:26px;border-bottom:1px solid ${C.line}}
  .brand{display:flex;align-items:center;gap:9px;font-family:'Fraunces',serif;font-weight:600;font-size:16px}
  .spark{width:28px;height:28px;border-radius:8px;background:${C.ink};display:grid;place-items:center;color:${C.bg};font-size:13px}
  .tag{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${C.inkFaint}}
  .eyebrow{font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${C.gold};display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .eyebrow::before{content:"";width:22px;height:1px;background:${C.gold}}
  .h1{font-size:38px;font-weight:500;margin-bottom:8px}
  .h1 em{font-style:italic;color:${C.gold}}
  .sub{color:${C.inkSoft};font-size:14.5px;max-width:560px}
  .block-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${C.inkFaint};margin:18px 0 10px}
  .pagenum{position:absolute;bottom:24px;left:52px;font-size:10px;font-weight:600;letter-spacing:.1em;color:${C.inkFaint}}
  .pagenum b{color:${C.ink}}

  .cover{justify-content:space-between;background:radial-gradient(620px 420px at 88% 10%,${C.goldSoft}88,transparent 65%),radial-gradient(520px 360px at 4% 94%,${C.blueSoft}66,transparent 70%),${C.bg}}
  .cover-mid{flex:1;display:flex;flex-direction:column;justify-content:center}
  .cover-logo{font-family:'Fraunces',serif;font-weight:500;font-size:74px;line-height:.98;letter-spacing:-.02em}
  .cover-logo em{font-style:italic;color:${C.gold};font-weight:400}
  .cover-rule{width:80px;height:2px;background:${C.gold};margin:28px 0 26px}
  .cover-title{font-family:'Fraunces',serif;font-weight:400;font-style:italic;font-size:23px;line-height:1.4;color:${C.inkSoft};max-width:600px}
  .cover-title b{font-style:normal;font-weight:500;color:${C.ink}}
  .cover-bottom{display:flex;gap:40px;margin-top:auto}
  .cover-meta .ml{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${C.inkFaint}}
  .cover-meta .mv{font-family:'Fraunces',serif;font-size:16px;font-weight:500;margin-top:3px}

  .meta-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:22px}
  .meta{background:${C.paper};border:1px solid ${C.line};border-radius:11px;padding:14px 16px}
  .meta .ml{font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${C.inkFaint}}
  .meta .mv{font-family:'Fraunces',serif;font-size:13.5px;font-weight:600;margin-top:3px}

  .channel-card{margin-top:24px;border:1px solid ${accent};background:${accentSoft};border-radius:16px;padding:26px 28px}
  .channel-card .ct{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${C.inkSoft}}
  .channel-card .cname{font-family:'Fraunces',serif;font-weight:600;font-size:40px;color:${accent};line-height:1;margin:6px 0 4px}
  .channel-card .carch{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.04em;color:${accent};background:${C.paper};border:1px solid ${accent};padding:4px 9px;border-radius:6px;margin-bottom:14px}
  .channel-card .crat{font-size:14px;color:${C.ink};line-height:1.55;max-width:620px}

  .stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}
  .stat{background:${C.paper};border:1px solid ${C.line};border-radius:13px;padding:20px}
  .stat .big{font-family:'Fraunces',serif;font-weight:500;font-size:30px;line-height:1}
  .stat .big.gold{color:${C.gold}}.stat .big.green{color:${C.green}}.stat .big.blue{color:${C.blue}}
  .stat .lbl{color:${C.inkSoft};font-size:12px;margin-top:7px}
  .stat .foot{color:${C.inkFaint};font-size:9.5px;margin-top:5px}

  .sec-title{font-family:'Fraunces',serif;font-size:24px;font-weight:500;margin-bottom:4px}

  .funnel{margin-top:18px;display:flex;flex-direction:column;gap:8px}
  .fbarwrap{display:flex;justify-content:center}
  .fbar{height:46px;border-radius:9px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;color:#fff}
  .fbar .fn{font-family:'Fraunces',serif;font-weight:600;font-size:14px}
  .fbar .fp{font-weight:700;font-size:13px;opacity:.92}

  .nodes{display:flex;flex-direction:column}
  .node{display:flex;align-items:center;gap:12px;background:${C.paper};border:1px solid ${C.line};border-radius:11px;padding:11px 15px}
  .node .nn{width:26px;height:26px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:${accentSoft};color:${accent};font-family:'Fraunces',serif;font-weight:600;font-size:13px}
  .node .nt{font-size:13px;font-weight:500}
  .conn{width:2px;height:9px;background:${C.line};margin-left:65px}

  .chips{display:flex;flex-wrap:wrap;gap:9px}
  .chip{display:flex;align-items:center;gap:8px;background:${C.paper};border:1px solid ${C.line};border-radius:9px;padding:9px 13px;font-size:12.5px;color:${C.ink}}
  .chip .cd{width:7px;height:7px;border-radius:50%;background:${C.gold};flex-shrink:0}

  .format-card{margin-top:8px;background:${C.goldSoft};border:1px solid ${C.gold};border-radius:13px;padding:18px 20px}
  .format-card .fmt-tipo{font-family:'Fraunces',serif;font-size:18px;font-weight:600}
  .format-card .fmt-motivo{font-size:13px;color:${C.inkSoft};margin-top:5px}

  .ue{margin-top:18px;background:${C.paper};border:1px solid ${C.line};border-radius:14px;padding:22px}
  .ue-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .ue-card{background:${C.bg};border:1px solid ${C.line};border-radius:10px;padding:14px}
  .ue-card .un{font-family:'Fraunces',serif;font-weight:600;font-size:22px}
  .ue-card .ul{font-size:10.5px;color:${C.inkSoft};margin-top:3px}
  .badge{display:inline-block;border-radius:6px;padding:5px 11px;font-size:11px;font-weight:700;letter-spacing:.04em;color:#fff;margin-top:16px;text-transform:uppercase}
  .ue-comment{font-size:12.5px;color:${C.inkSoft};margin-top:10px;line-height:1.5}
  .estimativa{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.06em;color:${C.amber};background:${C.amberSoft};padding:3px 8px;border-radius:5px;text-transform:uppercase;margin-left:4px}

  .goal-band{margin-top:20px;display:flex;justify-content:space-between;align-items:center;background:${C.ink};border-radius:14px;padding:18px 26px}
  .goal-band .gb-meta{font-size:14px;color:#e9e4d8}
  .goal-band .gb-meta b{font-family:'Fraunces',serif;font-weight:600;color:#fff;font-size:15px}
  .goal-band .gb-budget{font-family:'Fraunces',serif;font-size:27px;font-weight:600;color:${C.gold}}
  .goal-band .gb-budget span{font-size:13px;color:#bdb6a6;font-weight:400;font-family:'Inter',sans-serif;margin-left:6px}
  .scen-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-top:16px}
  .scen{background:${C.paper};border:1px solid ${C.line};border-radius:14px;padding:20px;position:relative}
  .scen.rec{border:1px solid ${C.gold};background:${C.goldSoft}}
  .scen .stag{position:absolute;top:-9px;left:18px;background:${C.ink};color:${C.bg};font-size:9px;font-weight:700;letter-spacing:.06em;padding:3px 9px;border-radius:5px}
  .scen .sname{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${C.inkFaint}}
  .scen .sbudget{font-family:'Fraunces',serif;font-weight:600;font-size:26px;margin:4px 0 2px}
  .scen .sbudget.rec{color:${C.gold}}
  .scen .sper{font-size:10.5px;color:${C.inkSoft};margin-bottom:14px}
  .scen .srow{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid ${C.lineSoft};font-size:12px}
  .scen .srow .sk{color:${C.inkSoft}}
  .scen .srow .sv{font-family:'Fraunces',serif;font-weight:600;font-size:14px}
  .proj-note{margin-top:14px;font-size:11.5px;color:${C.inkFaint};line-height:1.5}
</style></head><body>

<section class="page cover">
  ${head("Documento Confidencial")}
  <div class="cover-mid">
    <div class="cover-logo">Raio-X da<br><em>Aquisição B2B</em></div>
    <div class="cover-rule"></div>
    <p class="cover-title">Plano personalizado de <b>captação de clientes</b> para <b>${d.input.segmento}</b>.</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta"><div class="ml">Preparado para</div><div class="mv">${d.nome}</div></div>
    <div class="cover-meta"><div class="ml">Data</div><div class="mv">${d.data}</div></div>
    <div class="cover-meta"><div class="ml">Canal recomendado</div><div class="mv">${channelLabel}</div></div>
  </div>
  <div class="pagenum"><b>Raio-X</b> · Aquisição B2B</div>
</section>

<section class="page">
  ${head("Resumo")}
  <div class="eyebrow">Seu plano de captação</div>
  <h1 class="h1">Como atrair clientes<br>com <em>previsibilidade</em></h1>
  <p class="sub">Análise personalizada para ${d.input.segmento} — ${d.input.produtoPrincipal}.</p>
  <div class="meta-row">
    <div class="meta"><div class="ml">Segmento</div><div class="mv">${d.input.segmento}</div></div>
    <div class="meta"><div class="ml">Produto</div><div class="mv">${d.input.produtoPrincipal}</div></div>
    <div class="meta"><div class="ml">Faturamento</div><div class="mv">${d.input.faturamentoLabel}</div></div>
    <div class="meta"><div class="ml">Ticket médio</div><div class="mv">${d.input.ticketLabel}</div></div>
  </div>
  <div class="channel-card">
    <div class="ct">Canal recomendado</div>
    <div class="cname">${channelLabel}</div>
    <div class="carch">Arquétipo: ${d.archetypeNome}</div>
    <div class="crat">${d.rationale}</div>
  </div>
  <div class="stat-row">
    <div class="stat"><div class="big gold">${range(d.cpl.min, d.cpl.max)}</div><div class="lbl">CPL esperado</div><div class="foot">estimativa de mercado</div></div>
    <div class="stat"><div class="big blue">${d.funnel.lpConversion}%</div><div class="lbl">conversão da página em lead</div></div>
    <div class="stat"><div class="big green">${d.ue.leadsPorVenda}</div><div class="lbl">leads para cada venda</div></div>
  </div>
  <div class="pagenum"><b>01</b></div>
</section>

<section class="page">
  ${head("Os números")}
  <div class="eyebrow">Seu funil</div>
  <h2 class="sec-title">Do lead à venda</h2>
  <p class="sub">As taxas que você precisa buscar em cada etapa.</p>
  <div class="funnel">
    ${stages.map((s, i) => { const colors = [C.blue, C.gold, C.amber, C.green]; const w = 40 + (s.pct / 100) * 60; return `<div class="fbarwrap"><div class="fbar" style="width:${w}%;background:${colors[i]}"><span class="fn">${s.name}</span><span class="fp">${s.pct}%</span></div></div>`; }).join("")}
  </div>
  <div class="ue">
    <div class="eyebrow" style="margin-bottom:14px">A conta fecha?</div>
    <div class="ue-grid">
      <div class="ue-card"><div class="un">${d.ue.leadsPorVenda}</div><div class="ul">leads por venda</div></div>
      <div class="ue-card"><div class="un">${range(d.ue.cacMin, d.ue.cacMax)}</div><div class="ul">custo por cliente (CAC)</div></div>
      <div class="ue-card"><div class="un">${d.input.ticketLabel}</div><div class="ul">seu ticket médio</div></div>
    </div>
    <div class="badge" style="background:${verdictColor}">${d.ue.veredito}</div>
    <div class="ue-comment">No melhor caso, cada cliente custa ~${brl(d.ue.cacMin)} em mídia; no pior, ~${brl(d.ue.cacMax)}. Para o seu ticket, a conta ${d.ue.veredito === "saudável" ? "fecha com folga" : d.ue.veredito === "atenção" ? "fecha, mas exige eficiência" : "fica apertada"}.<span class="estimativa">números estimados</span></div>
  </div>
  <div class="pagenum"><b>02</b></div>
</section>

<section class="page">
  ${head("Execução")}
  ${d.channel === "google" ? execGoogle : execMeta}
  <div class="block-label" style="margin-top:22px">Ângulos de criativo</div>
  <div class="chips">${d.criativos.map((c) => `<div class="chip"><span class="cd"></span>${c}</div>`).join("")}</div>
  <div class="pagenum"><b>03</b></div>
</section>

<section class="page">
  ${head("Investimento & Projeção")}
  <div class="eyebrow">Quanto investir para bater sua meta</div>
  <h2 class="sec-title">Sua projeção de resultados</h2>
  <div class="goal-band">
    <div class="gb-meta">Sua meta · <b>${p.metaFrase}</b> em 12 meses</div>
    <div class="gb-budget">~${brl(Math.round(p.budgetRecomendado / 100) * 100)}<span>por mês em mídia</span></div>
  </div>
  <div class="scen-grid">
    ${p.scenarios.map((s) => `
      <div class="scen ${s.recomendado ? "rec" : ""}">
        ${s.recomendado ? '<div class="stag">SUA META</div>' : ""}
        <div class="sname">${s.nome}</div>
        <div class="sbudget ${s.recomendado ? "rec" : ""}">${brl(Math.round(s.budgetMensal / 100) * 100)}</div>
        <div class="sper">por mês em mídia</div>
        <div class="srow"><span class="sk">CPL estimado</span><span class="sv">${brl(s.cpl)}</span></div>
        <div class="srow"><span class="sk">Leads/mês</span><span class="sv">${s.leadsMes}</span></div>
        <div class="srow"><span class="sk">Vendas/mês</span><span class="sv">${s.vendasMes}</span></div>
        <div class="srow"><span class="sk">${recorrente ? "Nova receita/mês" : "Receita/mês"}</span><span class="sv">${brlK(s.receitaMes)}</span></div>
        <div class="srow"><span class="sk">Retorno</span><span class="sv">${s.roas.toFixed(1)}x</span></div>
      </div>`).join("")}
  </div>
  <div class="proj-note">A verba é <b>derivada da sua meta</b>: calculamos quantos clientes/mês você precisa e, pelas taxas do seu funil, quantos leads e quanta verba isso exige <span class="estimativa">números estimados</span><br>Cenários maiores assumem CPL mais alto (esgota o inventário barato → leads mais caros, retornos decrescentes). ${recorrente ? "Como seu serviço é <b>recorrente</b>, a receita se acumula mês a mês — o retorno ao longo do contrato é muito maior. " : ""}Considera apenas verba de mídia, não a sua capacidade de atendimento.</div>
  <div class="pagenum"><b>04</b></div>
</section>

</body></html>`;
}
