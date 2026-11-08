import { apiRequest, ApiError } from "./apiClient";

export const statusEstoque = ["No prazo", "Vence em breve", "Vencido"];

function mapItemEstoque(dto) {
    if (!dto || typeof dto !== "object" || dto.idMaterial == null || !statusEstoque.includes(dto.status)) {
        throw new ApiError("O servidor retornou um item de estoque inválido.", { code: "INVALID_RESPONSE" });
    }

    return {
        id: dto.idMaterial,
        nome: dto.nome ?? "",
        quantidade: dto.quantidade ?? "",
        unidade: dto.unidade ?? "",
        lote: dto.lote ?? "",
        dataEntrega: dto.dataDeRecebimento ?? "",
        dataValidade: dto.dataDeValidade ?? "",
        observacao: dto.observacoes ?? "",
        status: dto.status,
    };
}

export async function listarEstoque(options = {}) {
    const { data } = await apiRequest("/estoque", options);
    if (!Array.isArray(data)) {
        throw new ApiError("O servidor retornou uma lista de estoque inválida.", { code: "INVALID_RESPONSE" });
    }
    return data.map(mapItemEstoque);
}

function toRequestBody(item) {
    return {
        nome: item.nome,
        quantidade: item.quantidade === "" ? null : Number(item.quantidade),
        unidade: item.unidade,
        lote: item.lote,
        dataDeRecebimento: item.dataEntrega || null,
        dataDeValidade: item.dataValidade || null,
        observacoes: item.observacao || null,
    };
}

export async function criarItemEstoque(item, options = {}) {
    const { data } = await apiRequest("/estoque", {
        ...options,
        method: "POST",
        body: toRequestBody(item),
    });
    return mapItemEstoque(data);
}

export async function atualizarItemEstoque(id, item, options = {}) {
    const { data } = await apiRequest(`/estoque/${encodeURIComponent(id)}`, {
        ...options,
        method: "PUT",
        body: toRequestBody(item),
    });
    return mapItemEstoque(data);
}

export async function removerItemEstoque(id, options = {}) {
    return apiRequest(`/estoque/${encodeURIComponent(id)}`, { ...options, method: "DELETE" });
}

export function formatarDataEstoque(data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return "—";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

export function formatarQuantidade(quantidade) {
    if (quantidade == null || quantidade === "") return "—";
    const numero = Number(quantidade);
    return Number.isFinite(numero)
        ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(numero)
        : quantidade;
}
