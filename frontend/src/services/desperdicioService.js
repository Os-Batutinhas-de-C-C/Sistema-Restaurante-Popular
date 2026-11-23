import { apiRequest, ApiError } from "./apiClient";

export async function consultarDesperdicioHoje({ signal } = {}) {
    const { data } = await apiRequest("/desperdicio/hoje", { signal });
    const dia = data?.data;
    const dataIso = typeof dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dia)
        ? new Date(`${dia}T12:00:00Z`)
        : null;

    if (!dataIso || !Number.isFinite(dataIso.getTime()) || dataIso.toISOString().slice(0, 10) !== dia ||
        (data.desperdicioKg !== null && !Number.isFinite(data.desperdicioKg))) {
        throw new ApiError("O servidor retornou um registro de desperdício inválido.", { code: "INVALID_RESPONSE" });
    }

    return { data: dia, desperdicioKg: data.desperdicioKg };
}
