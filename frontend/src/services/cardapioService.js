const refeicoesMockadas = [
    {
        resumo: "Gado com legumes, omelete, arroz e feijão",
        pratoPrincipal: "Gado com legumes",
        opcaoProteica: "Omelete",
        acompanhamentos: "Arroz branco, feijão carioca e farofa de cuscuz",
        salada: "Salada crua",
        sobremesa: "Doce",
        suco: "Suco de polpa de cajá",
        calorias: 950,
    },
    {
        resumo: "Suíno ao molho, frango cozido, arroz e feijão",
        pratoPrincipal: "Suíno ao molho",
        opcaoProteica: "Frango cozido",
        acompanhamentos: "Arroz branco e feijão carioca",
        salada: "Salada da estação",
        sobremesa: "Fruta da estação",
        suco: "Suco de polpa de acerola",
        calorias: 890,
    },
    {
        resumo: "Suíno com legumes, omelete, arroz e feijão",
        pratoPrincipal: "Suíno com legumes",
        opcaoProteica: "Omelete",
        acompanhamentos: "Arroz branco, feijão carioca e farofa de cuscuz",
        salada: "Salada crua",
        sobremesa: "Doce",
        suco: "Suco de polpa de cajá",
        calorias: 920,
    },
];

const diasUteis = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

function inicioDaSemana(data, diaInicial = 0) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const diasARecuar = (inicio.getDay() - diaInicial + 7) % 7;
    inicio.setDate(inicio.getDate() - diasARecuar);
    return inicio;
}

export function obterIntervaloSemanaAtual() {
    const from = inicioDaSemana(new Date());
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    return { from, to };
}

function formatarData(data) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(data);
}

function formatarIsoLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function criarCardapiosMockados() {
    const segunda = inicioDaSemana(new Date(), 1);

    return diasUteis.map((nome, index) => {
        const data = new Date(segunda);
        data.setDate(data.getDate() + index);
        return {
            dia: formatarIsoLocal(data),
            nome,
            data: formatarData(data),
            refeicao: refeicoesMockadas[index] ?? null,
        };
    });
}

const cardapiosMockados = criarCardapiosMockados();

function dataLocal(isoDate) {
    const [ano, mes, dia] = isoDate.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

export function obterDadosCardapioMockados() {
    return {
        cardapios: cardapiosMockados,
        graficos: {
            fichas: [85, 85, 60, 0, 0],
            desperdicio: [15, 30, 30, 0, 0],
        },
    };
}

export function filtrarCardapiosPorIntervalo(cardapios, intervalo) {
    if (!intervalo?.from || !intervalo?.to) return [];

    const inicio = new Date(intervalo.from);
    const fim = new Date(intervalo.to);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    return cardapios.filter(({ dia }) => {
        const dataDoCardapio = dataLocal(dia);
        return dataDoCardapio >= inicio && dataDoCardapio <= fim;
    });
}
