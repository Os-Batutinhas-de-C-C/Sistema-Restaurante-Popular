const noticiasBase = [
    {
        id: 1,
        data: "2026-10-21",
        hora: "08:12",
        titulo: "Atualização do Cardápio",
        texto: "Atenção: o cardápio da próxima semana foi atualizado com novas opções de legumes e proteínas.",
        descricao: "Atenção: o cardápio da próxima semana foi atualizado com novas opções de legumes e proteínas.",
        duracaoHoras: 24,
        duracao: "24h",
    },
    {
        id: 2,
        data: "2026-10-22",
        hora: "09:45",
        titulo: "Manutenção no Refeitório",
        texto: "Avisamos que a área de atendimento será interrompida por 12 horas para manutenção preventiva.",
        descricao: "Avisamos que a área de atendimento será interrompida por 12 horas para manutenção preventiva.",
        duracaoHoras: 12,
        duracao: "12h",
    },
    {
        id: 3,
        data: "2026-10-23",
        hora: "11:20",
        titulo: "Campanha de Saúde",
        texto: "Nova campanha de alimentação saudável começa hoje com orientações de nutrição e hidratação.",
        descricao: "Nova campanha de alimentação saudável começa hoje com orientações de nutrição e hidratação.",
        duracaoHoras: 6,
        duracao: "6h",
    },
    {
        id: 4,
        data: "2026-10-28",
        hora: "15:40",
        titulo: "Entrega de Mercadorias",
        texto: "A entrega de novos insumos será feita amanhã pela manhã. Fiquem atentos ao horário de recebimento.",
        descricao: "A entrega de novos insumos será feita amanhã pela manhã. Fiquem atentos ao horário de recebimento.",
        duracaoHoras: 24,
        duracao: "24h",
    },
];

let noticiasEmMemoria = noticiasBase.map((noticia) => ({ ...noticia }));

function parseDateTime(data, hora) {
    const [ano, mes, dia] = data.split("-").map(Number);
    const [horas, minutos] = hora.split(":").map(Number);
    return new Date(ano, mes - 1, dia, horas, minutos, 0, 0);
}

function parseDateOnly(value) {
    const [ano, mes, dia] = value.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function getStartOfWeek(date = new Date()) {
    const inicio = new Date(date);
    inicio.setHours(0, 0, 0, 0);
    const diaDaSemana = inicio.getDay();
    const diff = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
    inicio.setDate(inicio.getDate() + diff);
    return inicio;
}

export function obterPeriodoPadrao() {
    const from = getStartOfWeek(new Date());
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    return { from, to };
}

export function listarNoticiasPorPeriodo(periodo) {
    const filtro = !periodo || !periodo.from || !periodo.to
        ? null
        : periodo;

    if (!filtro) {
        return [...noticiasEmMemoria].sort(
            (a, b) => parseDateTime(b.data, b.hora) - parseDateTime(a.data, a.hora),
        );
    }

    const inicio = new Date(filtro.from);
    const fim = new Date(filtro.to);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    return [...noticiasEmMemoria]
        .filter((noticia) => {
            const dataNoticia = parseDateOnly(noticia.data);
            return dataNoticia >= inicio && dataNoticia <= fim;
        })
        .sort((a, b) => parseDateTime(b.data, b.hora) - parseDateTime(a.data, a.hora));
}

export function publicarNoticia({ titulo, texto, duracaoHoras, data = new Date(), hora = new Date() }) {
    const tituloLimpo = String(titulo ?? "").trim();
    const textoLimpo = String(texto ?? "").trim();
    const horas = Number(duracaoHoras);

    if (!tituloLimpo || !textoLimpo || !Number.isInteger(horas) || horas < 1 || horas > 72) {
        throw new Error("Dados inválidos para publicação da notícia.");
    }

    const dataAtual = new Date(data);
    const horaAtual = new Date(hora);
    const duracaoEmTexto = `${horas}h`;

    const novaNoticia = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        data: `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}-${String(dataAtual.getDate()).padStart(2, "0")}`,
        hora: `${String(horaAtual.getHours()).padStart(2, "0")}:${String(horaAtual.getMinutes()).padStart(2, "0")}`,
        titulo: tituloLimpo,
        texto: textoLimpo,
        descricao: textoLimpo,
        duracaoHoras: horas,
        duracao: duracaoEmTexto,
    };

    noticiasEmMemoria = [novaNoticia, ...noticiasEmMemoria];
    return novaNoticia;
}

export function removerNoticia(id) {
    noticiasEmMemoria = noticiasEmMemoria.filter((noticia) => noticia.id !== id);
    return true;
}

export function resetarNoticiasMockadas() {
    noticiasEmMemoria = noticiasBase.map((noticia) => ({ ...noticia }));
}
