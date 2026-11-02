export function formatarData(data) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(ano, mes - 1, dia));
}

export function formatarDataHora(data, hora) {
    return formatarData(data) + " | " + hora;
}

export function resumirTexto(texto, limite = 100) {
    if (!texto) return "";
    return texto.length > limite ? texto.slice(0, limite).trimEnd() + "..." : texto;
}

export function obterDuracaoNoticia(noticia) {
    return noticia.duracao || String(noticia.duracaoHoras || 0) + "h";
}
