const relatoriosIniciais = [
    {
        id: "2026-09-21",
        data: "2026-09-21",
        refeicao: "Gado com Legumes, Omelete, ...",
        fichas: 85,
        desperdicioKg: 10,
        sobrasKg: 4,
        satisfacao: 4.6,
        editavel: false,
    },
    {
        id: "2026-09-22",
        data: "2026-09-22",
        refeicao: "Suíno ao Molho, Dobradinha, ...",
        fichas: 80,
        desperdicioKg: 30,
        sobrasKg: 5,
        satisfacao: 4.7,
        editavel: false,
    },
    {
        id: "2026-09-23",
        data: "2026-09-23",
        refeicao: "Suíno com Legumes, Omelete, ...",
        fichas: 60,
        desperdicioKg: 30,
        sobrasKg: 3,
        satisfacao: 4.5,
        editavel: true,
    },
    {
        id: "2026-09-24",
        data: "2026-09-24",
        refeicao: "Pendente",
        fichas: null,
        desperdicioKg: null,
        sobrasKg: null,
        satisfacao: null,
        editavel: true,
    },
    {
        id: "2026-09-25",
        data: "2026-09-25",
        refeicao: "Pendente",
        fichas: null,
        desperdicioKg: null,
        sobrasKg: null,
        satisfacao: null,
        editavel: true,
    },
];

const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const diasCompletos = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
];

function dataLocalParaIso(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(valor) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function formatarData(dataIso) {
    return new Intl.DateTimeFormat("pt-BR").format(criarDataLocal(dataIso));
}

function escaparCsv(valor) {
    return `"${String(valor ?? "").replaceAll('"', '""')}"`;
}

function escaparHtml(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[caractere]);
}

function obterValorNumerico(valor, nomeCampo, inteiro = false) {
    const numero = Number(String(valor).replace(",", "."));
    if (
        String(valor).trim() === "" ||
        !Number.isFinite(numero) ||
        numero < 0 ||
        (inteiro && !Number.isInteger(numero))
    ) {
        throw new Error(`Informe um valor válido e não negativo para ${nomeCampo}.`);
    }
    return numero;
}

export function obterPeriodoInicial() {
    return {
        from: new Date(2026, 8, 21),
        to: new Date(2026, 8, 25),
    };
}

export function obterRelatoriosIniciais() {
    return relatoriosIniciais.map((relatorio) => ({ ...relatorio }));
}

export function filtrarRelatoriosPorPeriodo(relatorios, periodo) {
    if (!periodo?.from) return [...relatorios];

    const inicio = dataLocalParaIso(periodo.from);
    const fim = periodo.to ? dataLocalParaIso(periodo.to) : inicio;
    return relatorios.filter((relatorio) => relatorio.data >= inicio && relatorio.data <= fim);
}

export function formatarDadosDoRelatorio(relatorios) {
    return relatorios.map((relatorio) => ({
        ...relatorio,
        dia: diasCompletos[criarDataLocal(relatorio.data).getDay()],
        dataFormatada: formatarData(relatorio.data),
    }));
}

export function obterDadosDosGraficos(relatorios) {
    const mediasPorDia = diasDaSemana.map((_, indiceDia) => {
        const registros = relatorios.filter(
            (relatorio) => (criarDataLocal(relatorio.data).getDay() + 6) % 7 === indiceDia,
        );
        const media = (campo) => {
            const valores = registros
                .map((registro) => registro[campo])
                .filter((valor) => Number.isFinite(valor));
            return valores.length
                ? valores.reduce((total, valor) => total + valor, 0) / valores.length
                : 0;
        };
        return {
            fichas: media("fichas"),
            desperdicio: media("desperdicioKg"),
        };
    });

    return {
        fichas: mediasPorDia.map((dia) => dia.fichas),
        desperdicio: mediasPorDia.map((dia) => dia.desperdicio),
    };
}

export function calcularIndicadores(relatorios) {
    const media = (campo) => {
        const valores = relatorios
            .map((relatorio) => relatorio[campo])
            .filter((valor) => Number.isFinite(valor));
        return valores.length
            ? valores.reduce((total, valor) => total + valor, 0) / valores.length
            : 0;
    };

    return {
        totalFichas: relatorios.reduce(
            (total, relatorio) => total + (relatorio.fichas ?? 0),
            0,
        ),
        mediaDesperdicioKg: media("desperdicioKg"),
        mediaSobrasKg: media("sobrasKg"),
        mediaSatisfacao: media("satisfacao"),
    };
}

export function atualizarRelatorio(relatorios, id, valores) {
    const fichas = obterValorNumerico(valores.fichas, "fichas", true);
    const desperdicioKg = obterValorNumerico(valores.desperdicioKg, "desperdício");

    if (!relatorios.some((relatorio) => relatorio.id === id)) {
        throw new Error("O registro selecionado não foi encontrado.");
    }

    return relatorios.map((relatorio) =>
        relatorio.id === id
            ? { ...relatorio, fichas, desperdicioKg }
            : relatorio,
    );
}

export function exportarRelatorioCsv(relatorios) {
    const dadosFormatados = formatarDadosDoRelatorio(relatorios);
    const cabecalho = [
        "Dia",
        "Data",
        "Refeição",
        "Fichas",
        "Desperdício (kg)",
        "Sobras (kg)",
        "Satisfação (0-5)",
    ];
    const linhas = dadosFormatados.map((relatorio) => [
        relatorio.dia,
        relatorio.dataFormatada,
        relatorio.refeicao,
        relatorio.fichas ?? "",
        relatorio.desperdicioKg ?? "",
        relatorio.sobrasKg ?? "",
        relatorio.satisfacao ?? "",
    ]);
    const conteudo = [cabecalho, ...linhas]
        .map((colunas) => colunas.map(escaparCsv).join(";"))
        .join("\r\n");
    const arquivo = new Blob(["\uFEFF", conteudo], {
        type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-nutricionista.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportarRelatorioPdf(relatorios, periodo) {
    const janela = window.open("", "_blank");
    if (!janela) {
        throw new Error("Permita a abertura de janelas para exportar o relatório em PDF.");
    }

    const linhas = formatarDadosDoRelatorio(relatorios)
        .map((relatorio) => `
            <tr>
                <td>${escaparHtml(relatorio.dia)}<br>${escaparHtml(relatorio.dataFormatada)}</td>
                <td>${escaparHtml(relatorio.refeicao)}</td>
                <td>${escaparHtml(relatorio.fichas ?? "—")}</td>
                <td>${escaparHtml(relatorio.desperdicioKg ?? "—")}</td>
                <td>${escaparHtml(relatorio.sobrasKg ?? "—")}</td>
                <td>${escaparHtml(relatorio.satisfacao ?? "—")}</td>
            </tr>
        `)
        .join("");
    const periodoFormatado = periodo?.from
        ? `${formatarData(dataLocalParaIso(periodo.from))} a ${formatarData(
              dataLocalParaIso(periodo.to ?? periodo.from),
          )}`
        : "Todos os períodos";

    janela.document.open();
    janela.document.write(`<!doctype html>
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8">
                <title>Relatório do Painel Nutricionista</title>
                <style>
                    body { color: #202124; font: 14px Arial, sans-serif; margin: 32px; }
                    h1 { font-size: 22px; margin-bottom: 4px; }
                    p { color: #4b5563; margin: 0 0 24px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border-bottom: 1px solid #dfe3e8; padding: 10px 8px; text-align: left; }
                    th { background: #f3f6f9; }
                    @media print { body { margin: 16mm; } }
                </style>
            </head>
            <body>
                <h1>Relatórios</h1>
                <p>Painel Nutricionista · ${escaparHtml(periodoFormatado)}</p>
                <table>
                    <thead><tr>
                        <th>Dia / data</th><th>Refeição</th><th>Fichas</th>
                        <th>Desperdício (kg)</th><th>Sobras (kg)</th><th>Satisfação</th>
                    </tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
            </body>
        </html>`);
    janela.document.close();
    janela.focus();
    janela.print();
}
