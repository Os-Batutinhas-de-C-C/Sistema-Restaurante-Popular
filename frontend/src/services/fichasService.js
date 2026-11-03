import { apiRequest, ApiError } from "./apiClient";

export const FICHAS_TIME_ZONE = "America/Fortaleza";

export function diaUtilFichas(dataIso) {
    const dia = new Date(`${dataIso}T12:00:00Z`).getUTCDay();
    return dia >= 1 && dia <= 5;
}

export function validarFichasDia(dto) {
    const data = typeof dto?.data === "string" ? new Date(`${dto.data}T12:00:00Z`) : null;
    if (
        !dto || !/^\d{4}-\d{2}-\d{2}$/.test(dto.data) || !data ||
        !Number.isFinite(data.getTime()) || data.toISOString().slice(0, 10) !== dto.data ||
        !Number.isSafeInteger(dto.entregues) || dto.entregues < 0 ||
        !Number.isSafeInteger(dto.capacidade) || dto.capacidade <= 0 ||
        !Number.isSafeInteger(dto.restantes) || dto.restantes !== Math.max(0, dto.capacidade - dto.entregues) ||
        typeof dto.permiteAdicionar !== "boolean" ||
        dto.permiteAdicionar !== (diaUtilFichas(dto.data) && dto.entregues < dto.capacidade)
    ) {
        throw new ApiError("O servidor retornou uma contagem de fichas inválida.", { code: "INVALID_RESPONSE" });
    }

    return {
        data: dto.data,
        entregues: dto.entregues,
        capacidade: dto.capacidade,
        restantes: dto.restantes,
        permiteAdicionar: dto.permiteAdicionar,
    };
}

export function dataIsoFortaleza(agora = new Date()) {
    const partes = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
        timeZone: FICHAS_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(agora).map(({ type, value }) => [type, value]));
    return `${partes.year}-${partes.month}-${partes.day}`;
}

export function formatarDataFichas(dataIso) {
    if (!dataIso) return "Carregando data...";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC", weekday: "long", day: "2-digit", month: "long", year: "numeric",
    }).format(new Date(`${dataIso}T12:00:00Z`));
}

export function formatarAtualizacaoFichas(instante) {
    if (!instante) return "Atualizar contagem";
    return `Atualizado às ${new Intl.DateTimeFormat("pt-BR", {
        timeZone: FICHAS_TIME_ZONE, hour: "2-digit", minute: "2-digit",
    }).format(instante)}`;
}

export function percentualFichas(dados) {
    return dados ? Math.min(100, (dados.entregues / dados.capacidade) * 100) : 0;
}

export async function consultarFichasHoje(options = {}) {
    const { data } = await apiRequest("/fichas/hoje", { ...options, auth: false });
    return validarFichasDia(data);
}

export async function adicionarFichaHoje({ signal } = {}) {
    const { data } = await apiRequest("/fichas/hoje/incrementos", { method: "POST", signal });
    return validarFichasDia(data);
}
