import { supabase } from "@/integrations/supabase/client";
import { formatCNPJ } from "@/lib/cnpj";

export interface BrasilAPIData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: string;
  porte: string;
  natureza_juridica: string;
  data_inicio_atividade: string;
  capital_social: number;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: string | null;
  data_exclusao_do_simples: string | null;
  opcao_pelo_mei: boolean;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  cnaes_secundarios: Array<{ codigo: number; descricao: string }>;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  qsa: Array<{
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    qualificacao_socio: string;
    data_entrada_sociedade: string;
    pais: string | null;
    faixa_etaria: string;
  }>;
}

export interface CompanyChange {
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  } catch { return iso; }
}

function formatDateTimeBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch { return iso; }
}

function formatCNAE(code: number): string {
  const s = String(code).padStart(7, "0");
  return `${s.slice(0, 4)}-${s[4]}/${s.slice(5)}`;
}

const FIELD_LABELS: Record<string, string> = {
  razao_social: "Razão Social",
  simples_nacional: "Simples Nacional",
  regime_tributario: "Regime Tributário",
  status_cadastral: "Status Cadastral",
  data_inicio_regime: "Data Início Regime",
  municipio: "Município",
  uf: "UF",
  porte: "Porte",
  nome_fantasia: "Nome Fantasia",
};

export async function fetchBrasilAPIFull(cnpj: string): Promise<BrasilAPIData | null> {
  try {
    const digits = cnpj.replace(/\D/g, "");
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function fetchCompanyHistory(companyId: string): Promise<CompanyChange[]> {
  const { data } = await supabase
    .from("company_changes")
    .select("field_name, old_value, new_value, changed_at")
    .eq("company_id", companyId)
    .order("changed_at", { ascending: false })
    .limit(20);
  return (data as any) || [];
}

export async function gerarRelatorioIndividual(
  cnpj: string,
  dbData: Record<string, any>,
  companyId?: string,
  observacoes?: string
): Promise<void> {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const { jsPDF } = jsPDFModule;
  const autoTable = autoTableModule.default;

  // Busca dados completos da BrasilAPI em paralelo com histórico
  const [apiData, history] = await Promise.all([
    fetchBrasilAPIFull(cnpj),
    companyId ? fetchCompanyHistory(companyId) : Promise.resolve([]),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  // Cores
  const PRIMARY = [30, 30, 46] as [number, number, number];       // dark bg
  const ACCENT = [99, 102, 241] as [number, number, number];      // indigo
  const TEXT = [30, 30, 46] as [number, number, number];
  const MUTED = [100, 116, 139] as [number, number, number];
  const WHITE: [number, number, number] = [255, 255, 255];
  const LIGHT_BG: [number, number, number] = [248, 250, 252];
  const BORDER: [number, number, number] = [226, 232, 240];

  let y = 0;

  // ── CABEÇALHO ──────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text("CNPJTrack", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 200);
  doc.text("Plataforma de Monitoramento Fiscal", margin, 17);
  doc.text("terminal fiscal", margin, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text("RELATÓRIO FISCAL DE CNPJ", pageW - margin, 11, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 200);
  doc.text(`Gerado em: ${formatDateTimeBR(new Date().toISOString())}`, pageW - margin, 17, { align: "right" });
  doc.text("USO EXCLUSIVO DO CONTADOR", pageW - margin, 22, { align: "right" });

  // Linha decorativa
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1);
  doc.line(0, 28, pageW, 28);

  y = 36;

  // ── IDENTIFICAÇÃO ──────────────────────────────────────────────────
  const sectionTitle = (title: string, yPos: number): number => {
    // Fundo levemente colorido na linha toda
    doc.setFillColor(238, 240, 255);
    doc.rect(margin, yPos, contentW, 7, "F");
    // Barra esquerda fina
    doc.setFillColor(...ACCENT);
    doc.rect(margin, yPos, 2, 7, "F");
    // Texto do título completo (com número) após a barra
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...ACCENT);
    doc.text(title, margin + 5, yPos + 4.8);
    return yPos + 11;
  };

  const field = (label: string, value: string, xLeft: number, xRight: number, yPos: number, cols = 1): number => {
    const colW = (contentW / 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), xLeft, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const lines = doc.splitTextToSize(value || "—", cols === 1 ? colW - 5 : contentW - 5);
    doc.text(lines, xLeft, yPos + 4);
    return yPos + 4 + (lines.length - 1) * 4;
  };

  y = sectionTitle("1. IDENTIFICAÇÃO DA EMPRESA", y);

  const razao = apiData?.razao_social || dbData.razao_social || "—";
  const fantasia = apiData?.nome_fantasia || dbData.nome_fantasia || "—";
  const situacao = apiData?.descricao_situacao_cadastral || dbData.status_cadastral || "—";
  const dataSituacao = formatDate(apiData?.data_situacao_cadastral);
  const porte = apiData?.porte || dbData.porte || "—";
  const natureza = apiData?.natureza_juridica || "—";
  const dataAbertura = formatDate(apiData?.data_inicio_atividade);
  const capitalSocial = apiData?.capital_social ? formatBRL(apiData.capital_social) : "—";
  const email = apiData?.email || "—";
  const telefone = apiData?.ddd_telefone_1 ? `(${apiData.ddd_telefone_1.slice(0, 2)}) ${apiData.ddd_telefone_1.slice(2)}` : "—";

  // Box CNPJ destacado
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, "FD");

  // CNPJ label pequeno acima
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.text("CNPJ", margin + 4, y + 4);

  // Número do CNPJ
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT);
  doc.text(formatCNPJ(cnpj), margin + 4, y + 10);

  // Status badge — lado direito, centralizado verticalmente no box
  const statusColor = situacao.toUpperCase().includes("ATIVA")
    ? ([34, 197, 94] as [number, number, number])
    : situacao.toUpperCase().includes("BAIXADA")
    ? ([100, 116, 139] as [number, number, number])
    : ([245, 158, 11] as [number, number, number]);
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageW - margin - 30, y + 3.5, 28, 5.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(situacao.toUpperCase().slice(0, 14), pageW - margin - 16, y + 7.5, { align: "center" });

  y += 16;

  // Campos em 2 colunas
  const col1 = margin;
  const col2 = margin + contentW / 2 + 2;
  const colW = contentW / 2 - 4;

  const rowH = 10;

  // Linha 1
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
  doc.text("RAZÃO SOCIAL", col1, y);
  doc.text("NOME FANTASIA", col2, y);
  y += 3.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
  const razaoLines = doc.splitTextToSize(razao, colW);
  const fantasiaLines = doc.splitTextToSize(fantasia, colW);
  doc.text(razaoLines, col1, y);
  doc.text(fantasiaLines, col2, y);
  y += Math.max(razaoLines.length, fantasiaLines.length) * 4 + 4;

  // Linha 2
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
  doc.text("PORTE", col1, y);
  doc.text("NATUREZA JURÍDICA", col2, y);
  y += 3.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
  const natureLines = doc.splitTextToSize(natureza, colW);
  doc.text(porte, col1, y);
  doc.text(natureLines, col2, y);
  y += Math.max(1, natureLines.length) * 4 + 4;

  // Linha 3
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
  doc.text("DATA DE ABERTURA", col1, y);
  doc.text("CAPITAL SOCIAL", col2, y);
  y += 3.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
  doc.text(dataAbertura, col1, y);
  doc.text(capitalSocial, col2, y);
  y += rowH;

  // Linha 4
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
  doc.text("E-MAIL", col1, y);
  doc.text("TELEFONE", col2, y);
  y += 3.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
  doc.text(email, col1, y);
  doc.text(telefone, col2, y);
  y += rowH;

  // ── SITUAÇÃO TRIBUTÁRIA ─────────────────────────────────────────────
  y = sectionTitle("2. SITUAÇÃO TRIBUTÁRIA", y);

  const regime = dbData.regime_tributario || "—";
  const simples = dbData.simples_nacional === true ? "Sim" : dbData.simples_nacional === false ? "Não" : "—";
  const dataSimples = formatDate(dbData.data_inicio_regime || apiData?.data_opcao_pelo_simples);
  const dataExclusao = formatDate(apiData?.data_exclusao_do_simples);
  const mei = apiData?.opcao_pelo_mei ? "Sim" : "Não";

  // Box tributário colorido
  const regimeColor: [number, number, number] =
    regime === "MEI" ? [99, 102, 241] :
    regime === "Simples" ? [34, 197, 94] :
    regime === "Lucro Presumido" ? [245, 158, 11] :
    regime === "Lucro Real" ? [239, 68, 68] : [100, 116, 139];

  doc.setFillColor(...regimeColor);
  doc.roundedRect(margin, y, 50, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("REGIME TRIBUTÁRIO", margin + 25, y + 4, { align: "center" });
  doc.setFontSize(11);
  doc.text(regime, margin + 25, y + 9.5, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
  doc.text("SIMPLES NACIONAL", col2, y + 1);
  doc.text("OPTANTE MEI", col2 + colW / 2, y + 1);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...TEXT);
  doc.text(simples, col2, y + 7);
  doc.text(mei, col2 + colW / 2, y + 7);
  y += 17;

  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
  doc.text("DATA DE OPÇÃO PELO SIMPLES", col1, y);
  doc.text("DATA DE EXCLUSÃO DO SIMPLES", col2, y);
  y += 3.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
  doc.text(dataSimples, col1, y);
  doc.text(dataExclusao, col2, y);
  y += rowH;

  // ── ENDEREÇO ────────────────────────────────────────────────────────
  y = sectionTitle("3. LOCALIZAÇÃO", y);

  if (apiData) {
    const endereco = [apiData.logradouro, apiData.numero, apiData.complemento].filter(Boolean).join(", ");
    const bairro = apiData.bairro || "—";
    const municipioUF = `${apiData.municipio || "—"}/${apiData.uf || "—"}`;
    const cep = apiData.cep ? apiData.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2") : "—";

    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.text("LOGRADOURO / NÚMERO / COMPLEMENTO", col1, y);
    doc.text("BAIRRO", col2, y);
    y += 3.5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
    const endLines = doc.splitTextToSize(endereco, colW);
    doc.text(endLines, col1, y);
    doc.text(bairro, col2, y);
    y += Math.max(endLines.length, 1) * 4 + 4;

    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.text("MUNICÍPIO / UF", col1, y);
    doc.text("CEP", col2, y);
    y += 3.5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
    doc.text(municipioUF, col1, y);
    doc.text(cep, col2, y);
    y += rowH;
  } else {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.text("MUNICÍPIO / UF", col1, y);
    y += 3.5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
    doc.text(`${dbData.municipio || "—"}/${dbData.uf || "—"}`, col1, y);
    y += rowH;
  }

  // ── ATIVIDADE ECONÔMICA ─────────────────────────────────────────────
  y = sectionTitle("4. ATIVIDADE ECONÔMICA (CNAEs)", y);

  if (apiData?.cnae_fiscal) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.text("CNAE PRINCIPAL", col1, y);
    y += 3.5;

    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(col1, y, contentW, 8, 1, 1, "FD");
    doc.setFont("courier", "bold"); doc.setFontSize(9); doc.setTextColor(...ACCENT);
    doc.text(formatCNAE(apiData.cnae_fiscal), col1 + 3, y + 5.5);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TEXT);
    const cnaePrincipalDesc = doc.splitTextToSize(apiData.cnae_fiscal_descricao || "—", contentW - 40);
    doc.text(cnaePrincipalDesc, col1 + 25, y + 5.5);
    y += 12;

    if (apiData.cnaes_secundarios?.length > 0) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...MUTED);
      doc.text(`CNAES SECUNDÁRIOS (${apiData.cnaes_secundarios.length})`, col1, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Código", "Descrição"]],
        body: apiData.cnaes_secundarios.map((c) => [formatCNAE(c.codigo), c.descricao]),
        styles: { font: "helvetica", fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
        alternateRowStyles: { fillColor: LIGHT_BG },
        columnStyles: { 0: { cellWidth: 25, font: "courier", fontStyle: "bold", textColor: ACCENT as any } },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }
  } else {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text("Dados de CNAE não disponíveis (API indisponível no momento da geração).", col1, y);
    y += rowH;
  }

  // ── QUADRO SOCIETÁRIO ───────────────────────────────────────────────
  if (apiData?.qsa?.length) {
    y = sectionTitle("5. QUADRO SOCIETÁRIO (QSA)", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Nome do Sócio", "CPF/CNPJ", "Qualificação", "Entrada na Sociedade"]],
      body: apiData.qsa.map((s) => [
        s.nome_socio,
        s.cnpj_cpf_do_socio || "—",
        s.qualificacao_socio,
        formatDate(s.data_entrada_sociedade),
      ]),
      styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: LIGHT_BG },
      theme: "grid",
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── HISTÓRICO DE ALTERAÇÕES ─────────────────────────────────────────
  if (history.length > 0) {
    // Verifica se precisa de nova página
    if (y > pageH - 80) { doc.addPage(); y = 20; }
    y = sectionTitle("6. HISTÓRICO DE ALTERAÇÕES", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Data / Hora", "Campo Alterado", "Valor Anterior", "Novo Valor"]],
      body: history.map((h) => [
        formatDateTimeBR(h.changed_at),
        FIELD_LABELS[h.field_name] || h.field_name,
        h.old_value || "—",
        h.new_value || "—",
      ]),
      styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: LIGHT_BG },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 38 },
        2: { textColor: [150, 150, 150] as any },
        3: { textColor: ACCENT as any, fontStyle: "bold" },
      },
      theme: "grid",
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── OBSERVAÇÕES ─────────────────────────────────────────────────────
  if (y > pageH - 50) { doc.addPage(); y = 20; }
  y = sectionTitle("7. OBSERVAÇÕES DO CONTADOR", y);

  if (observacoes?.trim()) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT);
    const obsLines = doc.splitTextToSize(observacoes, contentW);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 4 + 4;
  } else {
    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(margin, y, contentW, 24, 2, 2, "FD");
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text("Campo disponível para anotações do contador.", margin + 4, y + 8);
    y += 28;
  }

  // ── RODAPÉ ──────────────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...PRIMARY);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(180, 180, 200);
    doc.text("CNPJTrack — Plataforma de Monitoramento Fiscal", margin, pageH - 4);
    doc.text(
      `Documento gerado em ${formatDateTimeBR(new Date().toISOString())} · Página ${i}/${totalPages}`,
      pageW - margin, pageH - 4, { align: "right" }
    );
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.5);
    doc.line(0, pageH - 10, pageW, pageH - 10);
  }

  const filename = `CNPJTrack_${formatCNPJ(cnpj).replace(/\D/g, "")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export async function gerarRelatorioLote(
  companies: Array<{
    cnpj: string;
    razao_social?: string | null;
    regime_tributario?: string | null;
    simples_nacional?: boolean | null;
    status_cadastral?: string | null;
    municipio?: string | null;
    uf?: string | null;
    porte?: string | null;
    last_checked_at?: string | null;
  }>
): Promise<void> {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const { jsPDF } = jsPDFModule;
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;

  const PRIMARY: [number, number, number] = [30, 30, 46];
  const ACCENT: [number, number, number] = [99, 102, 241];
  const WHITE: [number, number, number] = [255, 255, 255];
  const LIGHT_BG: [number, number, number] = [248, 250, 252];

  // Cabeçalho
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...WHITE);
  doc.text("CNPJTrack", margin, 9);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(180, 180, 200);
  doc.text("Plataforma de Monitoramento Fiscal", margin, 15);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...WHITE);
  doc.text("RELATÓRIO DE MONITORAMENTO EM LOTE", pageW - margin, 9, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(180, 180, 200);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")} · ${companies.length} empresas`,
    pageW - margin, 15, { align: "right" }
  );
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.line(0, 22, pageW, 22);

  // Sumário rápido
  const ativas = companies.filter((c) => c.status_cadastral === "Ativa").length;
  const simples = companies.filter((c) => c.simples_nacional).length;
  const baixadas = companies.filter((c) => c.status_cadastral === "Baixada").length;

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, 26, 55, 14, 2, 2, "F");
  doc.roundedRect(margin + 60, 26, 55, 14, 2, 2, "F");
  doc.roundedRect(margin + 120, 26, 55, 14, 2, 2, "F");
  doc.roundedRect(margin + 180, 26, 55, 14, 2, 2, "F");

  const kpiBox = (label: string, value: string | number, x: number) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...PRIMARY);
    doc.text(String(value), x + 27, 36, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(label, x + 27, 38.5, { align: "center" });
  };
  kpiBox("Total de Empresas", companies.length, margin);
  kpiBox("Empresas Ativas", ativas, margin + 60);
  kpiBox("Empresas Baixadas", baixadas, margin + 120);
  kpiBox("No Simples Nacional", simples, margin + 180);

  // Tabela principal
  autoTable(doc, {
    startY: 45,
    margin: { left: margin, right: margin },
    head: [["CNPJ", "Razão Social", "Regime", "Simples", "Status", "Município/UF", "Porte", "Última Verificação"]],
    body: companies.map((c) => [
      formatCNPJ(c.cnpj),
      c.razao_social || "—",
      c.regime_tributario || "—",
      c.simples_nacional === true ? "Sim" : c.simples_nacional === false ? "Não" : "—",
      c.status_cadastral || "—",
      c.municipio ? `${c.municipio}/${c.uf || ""}` : "—",
      c.porte || "—",
      c.last_checked_at ? new Date(c.last_checked_at).toLocaleDateString("pt-BR") : "—",
    ]),
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: 32, font: "courier", fontStyle: "bold" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 20 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const val = String(data.cell.text);
        const color: [number, number, number] =
          val.includes("Ativa") ? [34, 197, 94] :
          val.includes("Baixada") ? [100, 116, 139] :
          val.includes("Suspensa") ? [245, 158, 11] : [239, 68, 68];
        doc.setFontSize(7);
        doc.setTextColor(...color);
      }
    },
    theme: "grid",
  });

  // Rodapé
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...PRIMARY);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(180, 180, 200);
    doc.text("CNPJTrack — Plataforma de Monitoramento Fiscal · Uso exclusivo do contador", margin, pageH - 3);
    doc.text(`Página ${i}/${totalPages}`, pageW - margin, pageH - 3, { align: "right" });
  }

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`CNPJTrack_Monitoramento_Lote_${date}.pdf`);
}
