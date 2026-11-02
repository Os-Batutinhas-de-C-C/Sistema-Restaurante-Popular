const mensagensBase = [
    {
        id: 1,
        data: "2026-10-30",
        hora: "08:12",
        titulo: "Solicitação de ajuste no cardápio",
        texto:
            "Boa tarde. Gostaria de solicitar uma opção de almoço mais leve para os próximos dias, principalmente com mais verduras e menos óleo.",
        nome: "Maria Silva",
        contato: "maria.silva@email.com",
    },
    {
        id: 2,
        data: "2026-10-29",
        hora: "09:45",
        titulo: "Sugestão de cardápio",
        texto:
            "Acredito que a semana poderia ter mais opções de leguminosas e menos fritura. A variedade seria bem recebida pela comunidade.",
        nome: "",
        contato: "",
    },
    {
        id: 3,
        data: "2026-10-27",
        hora: "11:20",
        titulo: "Opinião sobre o restaurante",
        texto:
            "Gostei muito da organização do ambiente e da simpatia da equipe. Continue com esse atendimento acolhedor.",
        nome: "João Pereira",
        contato: "joao.pereira@email.com",
    },
    {
        id: 4,
        data: "2026-10-26",
        hora: "14:05",
        titulo: "Sobre o almoço de segunda-feira",
        texto:
            "O almoço de hoje estava muito bom, mas o espaço para fila ficou mais apertado do que o normal. Poderiam melhorar a organização na entrada?",
        nome: "",
        contato: "",
    },
];

let mensagensEmMemoria = mensagensBase.map((mensagem) => ({ ...mensagem }));

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

export function listarMensagensPorPeriodo(periodo) {
    const filtro = !periodo || !periodo.from || !periodo.to ? null : periodo;

    if (!filtro) {
        return [...mensagensEmMemoria].sort(
            (a, b) => parseDateTime(b.data, b.hora) - parseDateTime(a.data, a.hora),
        );
    }

    const inicio = new Date(filtro.from);
    const fim = new Date(filtro.to);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    return [...mensagensEmMemoria]
        .filter((mensagem) => {
            const dataMensagem = parseDateOnly(mensagem.data);
            return dataMensagem >= inicio && dataMensagem <= fim;
        })
        .sort((a, b) => parseDateTime(b.data, b.hora) - parseDateTime(a.data, a.hora));
}

export function removerMensagem(id) {
    mensagensEmMemoria = mensagensEmMemoria.filter((mensagem) => mensagem.id !== id);
    return true;
}

export function resetarMensagensMockadas() {
    mensagensEmMemoria = mensagensBase.map((mensagem) => ({ ...mensagem }));
}
