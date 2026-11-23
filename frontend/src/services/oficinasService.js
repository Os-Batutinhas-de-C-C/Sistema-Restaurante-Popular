import { apiRequest } from "./apiClient";

const API = "/oficinas-ou-cursos";
const PUBLICAS = `${API}/publicas`;
export const ROTA_OFICINAS = "/painel-gestor/oficinas-ou-cursos";
export const TIPOS_OFICINA = { OFICINA: "Oficina", CURSO: "Curso" };
export const CUSTOS_OFICINA = { PAGO: "Pago", GRATUITO: "Gratuito" };
export const ESTADOS_OFICINA = {
    PROGRAMADO: "Programado",
    EM_ANDAMENTO: "Em andamento",
    ENCERRADO: "Encerrado",
};

const dados = (resposta) => resposta.data;
export const consultarProgramacao = (signal) => apiRequest(PUBLICAS, { auth: false, signal }).then(dados);
export const consultarMinhasInscricoes = (body) =>
    apiRequest(`${PUBLICAS}/minhas-inscricoes`, { method: "POST", auth: false, body }).then(dados);
export const inscreverEmOficina = (id, body) =>
    apiRequest(`${PUBLICAS}/${id}/inscricoes`, { method: "POST", auth: false, body }).then(dados);
export const cancelarMinhaInscricao = (id, body) =>
    apiRequest(`${PUBLICAS}/${id}/cancelamentos`, { method: "POST", auth: false, body });
export const consultarOficinas = (filtros, signal) => {
    const query = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor));
    return apiRequest(`${API}${query.size ? `?${query}` : ""}`, { signal }).then(dados);
};
export const consultarOficina = (id, signal) => apiRequest(`${API}/${id}`, { signal }).then(dados);
export const salvarOficina = (id, body) =>
    apiRequest(id ? `${API}/${id}` : API, { method: id ? "PUT" : "POST", body }).then(dados);
export const removerOficina = (id) => apiRequest(`${API}/${id}`, { method: "DELETE" });
export const consultarInscritos = (id, signal) =>
    apiRequest(`${API}/${id}/inscricoes`, { signal }).then(dados);
export const cancelarInscricaoComoGestor = (id, inscricaoId) =>
    apiRequest(`${API}/${id}/inscricoes/${inscricaoId}`, { method: "DELETE" });

export function formatarCpf(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    return digitos.replace(/^(\d{3})(?=\d)/, "$1.")
        .replace(/^(\d{3}\.\d{3})(?=\d)/, "$1.")
        .replace(/^(\d{3}\.\d{3}\.\d{3})(?=\d)/, "$1-");
}

export function formatarDataOficina(data) {
    return data.split("-").reverse().join("/");
}

export function formatarHorarioOficina(hora) {
    return hora.endsWith(":00") && hora.length === 8 ? hora.slice(0, 5) : hora;
}

const formatadorVagas = new Intl.NumberFormat("pt-BR");
export const formatarVagas = (vagas) => formatadorVagas.format(BigInt(vagas));

export function estadoEvento(evento, agora) {
    if (agora >= Date.parse(evento.fimEm)) return "ENCERRADO";
    return agora < Date.parse(evento.inicioEm) ? "PROGRAMADO" : "EM_ANDAMENTO";
}
