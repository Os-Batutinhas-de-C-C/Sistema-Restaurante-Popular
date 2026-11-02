let dataAtualMock = new Date(2026, 8, 23);
const relatoriosIniciais = [
    { id: "2026-09-21", data: "2026-09-21", refeicao: "Gado com Legumes, Omelete, ...", fichas: 85, desperdicioKg: 10, fichasPercentual: 85, desperdicioPercentual: 10 },
    { id: "2026-09-22", data: "2026-09-22", refeicao: "Suíno ao Molho, Dobradinha, ...", fichas: 80, desperdicioKg: 30, fichasPercentual: 80, desperdicioPercentual: 30 },
    { id: "2026-09-23", data: "2026-09-23", refeicao: "Suíno com Legumes, Omelete, ...", fichas: 60, desperdicioKg: 30, fichasPercentual: 60, desperdicioPercentual: 30 },
    { id: "2026-09-24", data: "2026-09-24", refeicao: "Pendente", fichas: null, desperdicioKg: null, fichasPercentual: 0, desperdicioPercentual: 0 },
    { id: "2026-09-25", data: "2026-09-25", refeicao: "Pendente", fichas: null, desperdicioKg: null, fichasPercentual: 0, desperdicioPercentual: 0 },
];

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const diasCompletos = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function dataLocalParaIso(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function criarDataLocal(valor) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function formatarData(dataIso) {
    return new Intl.DateTimeFormat("pt-BR").format(criarDataLocal(dataIso));
}

function segundaDaSemana(data) {
    const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    return inicio;
}

export function obterDataAtualMock() {
    return new Date(dataAtualMock);
}

export function configurarDataAtualMock(data) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
        throw new Error("Informe uma data válida para configurar o mock.");
    }
    dataAtualMock = new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function normalizarPeriodoSemana(data) {
    const from = segundaDaSemana(data);
    const to = new Date(from);
    to.setDate(from.getDate() + 4);
    return { from, to };
}

export function obterPeriodoInicial() {
    return normalizarPeriodoSemana(dataAtualMock);
}

export function obterRelatoriosIniciais() {
    return relatoriosIniciais.map((registro) => ({ ...registro }));
}

export function listarRelatoriosSemana(relatorios, periodo) {
    if (!periodo?.from) return [];
    const semana = normalizarPeriodoSemana(periodo.from);
    const existentes = new Map(relatorios.map((registro) => [registro.data, registro]));

    return Array.from({ length: 5 }, (_, indice) => {
        const data = new Date(semana.from);
        data.setDate(data.getDate() + indice);
        const iso = dataLocalParaIso(data);
        const registro = existentes.get(iso) ?? {
            id: iso,
            data: iso,
            refeicao: "Pendente",
            fichas: null,
            desperdicioKg: null,
            fichasPercentual: 0,
            desperdicioPercentual: 0,
        };
        return { ...registro, editavel: true };
    });
}

export function formatarDadosDoRelatorio(relatorios) {
    return relatorios.map((registro) => ({
        ...registro,
        dia: diasCompletos[criarDataLocal(registro.data).getDay()],
        dataFormatada: formatarData(registro.data),
    }));
}

export function obterDadosDosGraficos(relatorios) {
    const porData = new Map(relatorios.map((registro) => [registro.data, registro]));
    const periodo = relatorios.length ? normalizarPeriodoSemana(criarDataLocal(relatorios[0].data)) : obterPeriodoInicial();
    return {
        fichas: dias.map((_, indice) => {
            const data = new Date(periodo.from);
            data.setDate(data.getDate() + indice);
            return porData.get(dataLocalParaIso(data))?.fichasPercentual ?? 0;
        }),
        desperdicio: dias.map((_, indice) => {
            const data = new Date(periodo.from);
            data.setDate(data.getDate() + indice);
            return porData.get(dataLocalParaIso(data))?.desperdicioPercentual ?? 0;
        }),
    };
}

export function atualizarRelatorio(relatorios, id, valores) {
    const textoFichas = String(valores?.fichas ?? "").trim();
    const fichas = Number(textoFichas);
    const textoDesperdicio = String(valores?.desperdicioKg ?? "").trim().replace(",", ".");
    const desperdicioKg = Number(textoDesperdicio);
    if (!/^\d+$/.test(textoFichas) || !Number.isSafeInteger(fichas) || fichas < 0) {
        throw new Error("Informe uma quantidade de fichas inteira e maior ou igual a zero.");
    }
    if (!textoDesperdicio || !Number.isFinite(desperdicioKg) || desperdicioKg < 0 || !/^\d+(\.\d)?$/.test(textoDesperdicio)) {
        throw new Error("Informe um desperdício válido, maior ou igual a zero e com até uma casa decimal.");
    }
    const existe = relatorios.some((registro) => registro.id === id);
    const atualizados = relatorios.map((registro) => registro.id === id
        ? { ...registro, fichas, fichasPercentual: Math.min(fichas, 100), desperdicioKg, desperdicioPercentual: Math.min(desperdicioKg, 100) }
        : registro);
    return existe ? atualizados : [...atualizados, { id, data: id, refeicao: "Pendente", fichas, desperdicioKg, fichasPercentual: Math.min(fichas, 100), desperdicioPercentual: Math.min(desperdicioKg, 100) }];
}

function escaparCsv(valor) {
    return `"${String(valor ?? "").replaceAll('"', '""')}"`;
}

export function gerarConteudoCsv(relatorios) {
    const cabecalho = ["Dia", "Data", "Cardápio", "Fichas", "Desperdício (kg)"];
    const linhas = formatarDadosDoRelatorio(relatorios).map((r) => [r.dia, r.dataFormatada, r.refeicao, r.fichas ?? "-", r.desperdicioKg ?? "-"]);
    return [cabecalho, ...linhas].map((linha) => linha.map(escaparCsv).join(";")).join("\r\n");
}

export function nomeArquivoRelatorio(periodo, extensao) {
    const semana = normalizarPeriodoSemana(periodo?.from ?? dataAtualMock);
    const formato = (data) => `${String(data.getDate()).padStart(2, "0")}-${String(data.getMonth() + 1).padStart(2, "0")}-${data.getFullYear()}`;
    return `relatorio-${formato(semana.from)}-a-${formato(semana.to)}.${extensao}`;
}
