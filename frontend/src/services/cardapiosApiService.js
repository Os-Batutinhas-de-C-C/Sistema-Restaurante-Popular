import { apiRequest, ApiError } from "./apiClient";

export const DIAS_UTEIS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

function validarSemana(dto) {
    if (!dto || typeof dto !== "object" || !/^\d{4}-\d{2}-\d{2}$/.test(dto.data) || !Array.isArray(dto.cardapio) || dto.cardapio.length !== 5) {
        throw new ApiError("O servidor retornou um cardápio semanal inválido.", { code: "INVALID_RESPONSE" });
    }
    return dto;
}

export async function listarSemanasApi(options = {}) {
    const { data } = await apiRequest("/semanas", options);
    if (!Array.isArray(data)) {
        throw new ApiError("O servidor retornou uma lista de cardápios inválida.", { code: "INVALID_RESPONSE" });
    }
    return data.map(validarSemana);
}

export async function listarCardapiosPublicosApi(options = {}) {
    const { data } = await apiRequest("/cardapios/publicos", options);
    if (!Array.isArray(data)) {
        throw new ApiError("O servidor retornou uma lista de cardápios inválida.", { code: "INVALID_RESPONSE" });
    }
    return data.map(validarSemana);
}

export function mapearRefeicao(dto) {
    if (!dto) return null;
    return {
        idRefeicao: dto.idRefeicao,
        pratoProteico: dto.proteina ?? "",
        opcaoProteica: dto.opcaoProteica ?? "",
        acompanhamento1: dto.acompanhamento1 ?? "",
        acompanhamento2: dto.acompanhamento2 ?? "",
        guarnicao: dto.guarnicao ?? "",
        saladaDoDia: dto.saladaDoDia ?? "",
        sobremesa: dto.sobremesa ?? "",
        sucoNatural: dto.suco ?? "",
        valorCalorico: dto.calorias == null ? "" : String(dto.calorias),
    };
}

export function dataIsoLocal(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dataDeIsoLocal(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function obterSegundaIso(date) {
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    const day = monday.getDay();
    monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
    return dataIsoLocal(monday);
}

export function mapearSemanaParaDias(semana) {
    validarSemana(semana);
    const monday = dataDeIsoLocal(semana.data);
    return semana.cardapio.map((refeicao, index) => {
        const date = new Date(monday);
        date.setDate(date.getDate() + index);
        const data = dataIsoLocal(date);
        return {
            dia: data,
            nome: DIAS_UTEIS[index],
            data: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date),
            refeicao: mapearRefeicao(refeicao),
            idRefeicao: refeicao?.idRefeicao ?? null,
        };
    });
}

export async function obterSemanaApi(dataSegunda, options = {}) {
    const semanas = await listarSemanasApi(options);
    return semanas.find((semana) => semana.data === dataSegunda) ?? null;
}

export async function salvarRefeicaoDiaApi(dataDia, valores, options = {}) {
    const monday = obterSegundaIso(dataDeIsoLocal(dataDia));
    const dateIndex = Math.round((dataDeIsoLocal(dataDia) - dataDeIsoLocal(monday)) / 86400000);
    if (dateIndex < 0 || dateIndex > 4) {
        throw new ApiError("A data selecionada não pertence a um dia útil da semana.", { code: "INVALID_WEEKDAY" });
    }

    const semana = await obterSemanaApi(monday, options);
    const cardapio = semana
        ? semana.cardapio.map((refeicao) => refeicao ? { idRefeicao: refeicao.idRefeicao } : null)
        : Array(5).fill(null);
    const hasContent = [
        valores.pratoProteico, valores.opcaoProteica, valores.acompanhamento1,
        valores.acompanhamento2, valores.guarnicao, valores.saladaDoDia,
        valores.sobremesa, valores.sucoNatural, valores.valorCalorico,
    ].some((value) => String(value ?? "").trim() !== "");

    cardapio[dateIndex] = hasContent ? {
        proteina: valores.pratoProteico?.trim() || null,
        opcaoProteica: valores.opcaoProteica?.trim() || null,
        acompanhamento1: valores.acompanhamento1?.trim() || null,
        acompanhamento2: valores.acompanhamento2?.trim() || null,
        guarnicao: valores.guarnicao?.trim() || null,
        saladaDoDia: valores.saladaDoDia?.trim() || null,
        sobremesa: valores.sobremesa?.trim() || null,
        suco: valores.sucoNatural?.trim() || null,
        calorias: Number(valores.valorCalorico) || 0,
    } : null;

    const body = {
        desperdicio: semana?.desperdicio ?? [],
        cardapio,
    };

    const result = semana
        ? await apiRequest(`/semanas/${monday}`, { ...options, method: "PUT", body })
        : await apiRequest("/semanas", { ...options, method: "POST", body: { data: monday, ...body } });
    return validarSemana(result.data);
}

export async function salvarDesperdicioDiaApi(dataDia, desperdicio, options = {}) {
    const monday = obterSegundaIso(dataDeIsoLocal(dataDia));
    const dateIndex = Math.round((dataDeIsoLocal(dataDia) - dataDeIsoLocal(monday)) / 86400000);
    if (dateIndex < 0 || dateIndex > 4 || !Number.isFinite(Number(desperdicio)) || Number(desperdicio) < 0) {
        throw new ApiError("O valor de desperdício ou a data selecionada é inválido.", { code: "INVALID_WASTE" });
    }

    const semana = await obterSemanaApi(monday, options);
    const desperdicioPorDia = Array.from({ length: 5 }, (_, index) => semana?.desperdicio?.[index] ?? null);
    desperdicioPorDia[dateIndex] = Number(desperdicio);
    const cardapio = semana
        ? semana.cardapio.map((refeicao) => refeicao ? { idRefeicao: refeicao.idRefeicao } : null)
        : Array(5).fill(null);
    const body = {
        desperdicio: desperdicioPorDia,
        cardapio,
    };
    const result = semana
        ? await apiRequest(`/semanas/${monday}`, { ...options, method: "PUT", body })
        : await apiRequest("/semanas", { ...options, method: "POST", body: { data: monday, ...body } });
    return validarSemana(result.data);
}

export function transformarHistorico(semana) {
    return mapearSemanaParaDias(semana).map(({ nome, dia, refeicao }) => ({
        dia: nome,
        data: dia,
        pratoProteico: refeicao?.pratoProteico ?? "",
        opcaoProteica: refeicao?.opcaoProteica ?? "",
        acompanhamento1: refeicao?.acompanhamento1 ?? "",
        acompanhamento2: refeicao?.acompanhamento2 ?? "",
        guarnicao: refeicao?.guarnicao ?? "",
        saladaDoDia: refeicao?.saladaDoDia ?? "",
        sobremesa: refeicao?.sobremesa ?? "",
        sucoNatural: refeicao?.sucoNatural ?? "",
        valorCalorico: refeicao?.valorCalorico ?? "",
    }));
}
