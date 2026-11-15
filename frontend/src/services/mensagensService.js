import { apiRequest, ApiError } from "./apiClient";

function parseDateOnly(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
        Number.isNaN(date.getTime()) || date.getFullYear() !== year ||
        date.getMonth() !== month - 1 || date.getDate() !== day
    ) return null;
    return date;
}

function parseDateTime(data, hora) {
    const date = parseDateOnly(data);
    if (!date) return 0;
    const [hours = 0, minutes = 0, seconds = 0] = String(hora ?? "").split(":").map(Number);
    date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
    return date.getTime();
}

function parseDataDoFiltro(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value);
    }
    if (typeof value === "string") {
        const dataLocal = parseDateOnly(value);
        if (dataLocal) return dataLocal;
    }
    const data = new Date(value);
    return Number.isNaN(data.getTime()) ? null : data;
}

function mapMensagem(dto) {
    if (!dto || typeof dto !== "object" || dto.idMensagem == null) {
        throw new ApiError("O servidor retornou uma mensagem inválida.", { code: "INVALID_RESPONSE" });
    }

    return {
        id: dto.idMensagem,
        data: dto.data ?? "",
        hora: typeof dto.horario === "string" ? dto.horario.slice(0, 5) : "—",
        titulo: dto.assunto ?? "",
        texto: dto.texto ?? "",
        usuarioId: dto.usuarioId ?? null,
    };
}

function getStartOfWeek(date = new Date()) {
    const inicio = new Date(date);
    inicio.setHours(0, 0, 0, 0);
    const diaDaSemana = inicio.getDay();
    inicio.setDate(inicio.getDate() + (diaDaSemana === 0 ? -6 : 1 - diaDaSemana));
    return inicio;
}

export function obterPeriodoPadrao() {
    const from = getStartOfWeek();
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    return { from, to };
}

export async function listarMensagensPorPeriodo(periodo, options = {}) {
    const { data } = await apiRequest("/mensagens", options);
    if (!Array.isArray(data)) {
        throw new ApiError("O servidor retornou uma lista de mensagens inválida.", { code: "INVALID_RESPONSE" });
    }

    const mensagens = data.map(mapMensagem);
    const ordenarMaisRecentes = (primeira, segunda) =>
        parseDateTime(segunda.data, segunda.hora) - parseDateTime(primeira.data, primeira.hora);
    const filtro = periodo?.from && periodo?.to ? periodo : null;
    if (!filtro) return mensagens.sort(ordenarMaisRecentes);

    const inicio = parseDataDoFiltro(filtro.from);
    const fim = parseDataDoFiltro(filtro.to);
    if (!inicio || !fim) {
        throw new ApiError("O intervalo de datas selecionado é inválido.", { code: "INVALID_PERIOD" });
    }
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    return mensagens
        .filter((mensagem) => {
            const dataMensagem = parseDateOnly(mensagem.data);
            return dataMensagem !== null && dataMensagem >= inicio && dataMensagem <= fim;
        })
        .sort(ordenarMaisRecentes);
}

export async function enviarMensagemPublica({ assunto, mensagem }, options = {}) {
    const { data } = await apiRequest("/mensagens/publicas", {
        ...options,
        method: "POST",
        body: { assunto, texto: mensagem },
    });
    return data;
}

export async function removerMensagem(id, options = {}) {
    return apiRequest(`/mensagens/${encodeURIComponent(id)}`, {
        ...options,
        method: "DELETE",
    });
}

