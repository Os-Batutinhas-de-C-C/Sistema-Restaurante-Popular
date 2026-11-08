import { getAccessToken } from "./authSession";

const API_ROOT = "/api";

const STATUS_MESSAGES = {
    400: "Os dados enviados foram rejeitados. Confira os campos e tente novamente.",
    401: "Não foi possível autenticar esta solicitação.",
    403: "Seu perfil não tem permissão para esta operação.",
    404: "O registro solicitado não foi encontrado.",
    500: "O servidor não conseguiu concluir a solicitação.",
};

export class ApiError extends Error {
    constructor(message, { status = 0, code = "API_ERROR" } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

function apiPath(path) {
    if (typeof path !== "string" || !path.trim()) {
        throw new ApiError("O caminho da API não foi informado.", { code: "INVALID_PATH" });
    }

    const normalized = path.startsWith("/") ? path : `/${path}`;
    return normalized === API_ROOT || normalized.startsWith(`${API_ROOT}/`)
        ? normalized
        : `${API_ROOT}${normalized}`;
}

async function readResponseBody(response) {
    const bodyText = await response.text();
    if (!bodyText) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLocaleLowerCase("en-US").includes("json")) return bodyText;

    try {
        return JSON.parse(bodyText);
    } catch {
        throw new ApiError("O servidor retornou uma resposta JSON inválida.", {
            status: response.status,
            code: "INVALID_RESPONSE",
        });
    }
}

function responseError(response, body) {
    if (
        body &&
        typeof body === "object" &&
        typeof body.code === "string" &&
        typeof body.message === "string"
    ) {
        return new ApiError(body.message, { status: response.status, code: body.code });
    }

    return new ApiError(
        STATUS_MESSAGES[response.status] || "Não foi possível concluir a solicitação.",
        { status: response.status, code: `HTTP_${response.status}` },
    );
}

/**
 * Sends a request through the same-origin Next.js rewrite to the Spring API.
 * Writes are never retried automatically.
 */
export async function apiRequest(path, { method = "GET", body, headers: customHeaders, signal, auth = true } = {}) {
    const headers = new Headers(customHeaders);
    headers.set("Accept", "application/json");
    if (auth) {
        const accessToken = getAccessToken();
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
        headers.delete("Authorization");
    }

    let requestBody = body;
    if (body !== undefined && body !== null && typeof body !== "string") {
        requestBody = JSON.stringify(body);
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
    }

    let response;
    try {
        response = await fetch(apiPath(path), {
            method: method.toUpperCase(),
            headers,
            body: requestBody,
            signal,
            credentials: "omit",
            cache: "no-store",
        });
    } catch {
        throw new ApiError("Não foi possível conectar ao servidor. Tente novamente.", {
            code: "NETWORK_ERROR",
        });
    }

    let data;
    try {
        data = await readResponseBody(response);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Não foi possível ler a resposta do servidor.", {
            status: response.status,
            code: "INVALID_RESPONSE",
        });
    }

    if (!response.ok) {
        throw responseError(response, data);
    }

    return { status: response.status, data };
}
