import { jsPDF } from "jspdf";
import { formatarDadosDoRelatorio, gerarConteudoCsv, nomeArquivoRelatorio, normalizarPeriodoSemana } from "../services/relatoriosService";

export function exportarCsv(relatorios, periodo) {
    const arquivo = new Blob(["\uFEFF", gerarConteudoCsv(relatorios)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivoRelatorio(periodo, "csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportarPdf(relatorios, periodo) {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const semana = normalizarPeriodoSemana(periodo?.from ?? new Date(2026, 8, 23));
    const formatarData = (data) => new Intl.DateTimeFormat("pt-BR").format(data);
    pdf.setFontSize(16);
    pdf.text("Relatório semanal", 14, 18);
    pdf.setFontSize(10);
    pdf.text(`${formatarData(semana.from)} – ${formatarData(semana.to)}`, 14, 25);

    const cols = [14, 69, 96, 218, 243];
    const headers = ["Dia / data", "Cardápio", "Fichas", "Desperdício (kg)"];
    pdf.setFillColor(243, 246, 249);
    pdf.rect(14, 32, 269, 10, "F");
    pdf.setFont("helvetica", "bold");
    headers.forEach((text, index) => pdf.text(text, cols[index], 39));

    pdf.setFont("helvetica", "normal");
    formatarDadosDoRelatorio(relatorios).forEach((registro, index) => {
        const y = 50 + index * 15;
        pdf.setDrawColor(225, 230, 235);
        pdf.line(14, y + 5, 283, y + 5);
        pdf.text([registro.dia, registro.dataFormatada], cols[0], y, { maxWidth: 52 });
        pdf.text(registro.refeicao || "Pendente", cols[1], y, { maxWidth: 118 });
        pdf.text(String(registro.fichas ?? "-"), cols[2], y);
        pdf.text(String(registro.desperdicioKg ?? "-"), cols[3], y);
    });
    pdf.save(nomeArquivoRelatorio(periodo, "pdf"));
}
