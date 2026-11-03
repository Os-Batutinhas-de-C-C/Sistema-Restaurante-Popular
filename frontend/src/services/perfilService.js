import { apiRequest, ApiError } from "./apiClient";

const PERFIS = { N: "Nutricionista", C: "Caixa", G: "Gestor" };

function mapearPerfil(dto) {
    if (
        !dto || !Number.isSafeInteger(dto.idUsuario) || dto.idUsuario <= 0 ||
        typeof dto.tipo !== "string" || dto.tipo.length !== 1 ||
        (dto.nome != null && typeof dto.nome !== "string") ||
        (dto.emailRecuperacao != null && typeof dto.emailRecuperacao !== "string")
    ) {
        throw new ApiError("O servidor retornou um perfil inválido.", { code: "INVALID_RESPONSE" });
    }

    return {
        idUsuario: dto.idUsuario,
        nome: dto.nome ?? "",
        emailRecuperacao: dto.emailRecuperacao ?? "",
        tipo: dto.tipo,
        perfil: PERFIS[dto.tipo.toUpperCase()] ?? "Usuário",
    };
}

export function perfilParaSessao(perfil) {
    return {
        idUsuario: perfil.idUsuario,
        nome: perfil.nome,
        email: perfil.emailRecuperacao,
        perfil: perfil.perfil,
    };
}

export async function obterMeuPerfil(options = {}) {
    const { data } = await apiRequest("/usuarios/me", options);
    return mapearPerfil(data);
}

export async function salvarMeuPerfil({ nome, emailRecuperacao, senhaAtual }) {
    const { data } = await apiRequest("/usuarios/me", {
        method: "PUT",
        body: { nome: nome.trim(), emailRecuperacao: emailRecuperacao.trim(), senhaAtual },
    });
    if (!data || typeof data.requerNovoLogin !== "boolean") {
        throw new ApiError("O servidor retornou uma confirmação inválida.", { code: "INVALID_RESPONSE" });
    }
    return { usuario: mapearPerfil(data.usuario), requerNovoLogin: data.requerNovoLogin };
}

export async function alterarMinhaSenha({ senhaAtual, novaSenha, confirmacaoSenha }) {
    const { status } = await apiRequest("/usuarios/me/senha", {
        method: "PUT",
        body: { senhaAtual, novaSenha, confirmacaoSenha },
    });
    if (status !== 204) {
        throw new ApiError("O servidor retornou uma confirmação inválida.", { code: "INVALID_RESPONSE" });
    }
}
