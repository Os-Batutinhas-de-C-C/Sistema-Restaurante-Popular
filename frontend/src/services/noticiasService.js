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

function mapNoticia(dto) {
    if (!dto || typeof dto !== "object" || dto.idMensagem == null) {
        throw new ApiError("O servidor retornou uma notícia inválida.", { code: "INVALID_RESPONSE" });
    }

    const duracaoHoras = Number.isFinite(dto.duracao) ? dto.duracao : null;
    return {
        id: dto.idMensagem,
        data: dto.data ?? "",
        hora: typeof dto.horario === "string" ? dto.horario.slice(0, 5) : "—",
        titulo: dto.assunto ?? "",
        texto: dto.texto ?? "",
        descricao: dto.texto ?? "",
        duracaoHoras,
        duracao: duracaoHoras !== null ? `${duracaoHoras}h` : "—",
    };
}

function estaNoPeriodo(noticia, inicio, fim) {
    const data = parseDateOnly(noticia.data);
    return data !== null && data >= inicio && data <= fim;
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

function ordenarMaisRecentes(primeira, segunda) {
    return parseDateTime(segunda.data, segunda.hora) - parseDateTime(primeira.data, primeira.hora);
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

export async function listarNoticiasPorPeriodo(periodo, options = {}) {
    const { data } = await apiRequest("/noticias", options);
    if (!Array.isArray(data)) {
        throw new ApiError("O servidor retornou uma lista de notícias inválida.", { code: "INVALID_RESPONSE" });
    }

    const noticias = data.map(mapNoticia);
    const filtro = periodo?.from && periodo?.to ? periodo : null;
    if (!filtro) return noticias.sort(ordenarMaisRecentes);

    const inicio = parseDataDoFiltro(filtro.from);
    const fim = parseDataDoFiltro(filtro.to);
    if (!inicio || !fim) {
        throw new ApiError("O intervalo de datas selecionado é inválido.", { code: "INVALID_PERIOD" });
    }
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    return noticias
        .filter((noticia) => estaNoPeriodo(noticia, inicio, fim))
        .sort(ordenarMaisRecentes);
}

function toApiDate(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toApiTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

export async function publicarNoticia(values, options = {}) {
    const { data } = await apiRequest("/noticias", {
        ...options,
        method: "POST",
        body: {
            assunto: values.assunto ?? values.titulo,
            texto: values.texto,
            horario: toApiTime(values.horario ?? values.hora),
            data: toApiDate(values.data),
            duracao: Number(values.duracao ?? values.duracaoHoras),
        },
    });
    return mapNoticia(data);
}

export async function removerNoticia(id, options = {}) {
    return apiRequest(`/noticias/${encodeURIComponent(id)}`, {
        ...options,
        method: "DELETE",
    });
}
