export const camposCardapio = [
    { key: "pratoProteico", label: "Prato Proteico" },
    { key: "opcaoProteica", label: "Opção Proteica" },
    { key: "acompanhamento1", label: "Acompanhamento 1" },
    { key: "acompanhamento2", label: "Acompanhamento 2" },
    { key: "guarnicao", label: "Guarnição" },
    { key: "saladaDoDia", label: "Salada do Dia" },
    { key: "sobremesa", label: "Sobremesa" },
    { key: "sucoNatural", label: "Suco Natural" },
    { key: "valorCalorico", label: "Valor Calórico Estimado (kcal)" },
];

export const cardapioVazio = Object.fromEntries(camposCardapio.map(({ key }) => [key, ""]));

export const historicoCardapiosMockados = [
    {
        dia: "Segunda-feira",
        data: "2026-09-21",
        pratoProteico: "Gado com Legumes",
        opcaoProteica: "Omelete",
        acompanhamento1: "Arroz à Grega",
        acompanhamento2: "Feijão de Corda",
        guarnicao: "Farofa de Cuscuz",
        saladaDoDia: "Salada Crua",
        sobremesa: "Doce",
        sucoNatural: "Suco de Polpa de Cajá",
        valorCalorico: "930",
    },
    {
        dia: "Terça-feira",
        data: "2026-09-22",
        pratoProteico: "Suíno ao Molho",
        opcaoProteica: "Frango Cozido",
        acompanhamento1: "Arroz Branco",
        acompanhamento2: "Feijão Carioca",
        guarnicao: "Macarrão",
        saladaDoDia: "Salada da Estação",
        sobremesa: "Fruta da Estação",
        sucoNatural: "Suco de Polpa de Acerola",
        valorCalorico: "890",
    },
    {
        dia: "Quarta-feira",
        data: "2026-09-23",
        pratoProteico: "Suíno com Legumes",
        opcaoProteica: "Omelete",
        acompanhamento1: "Arroz Branco",
        acompanhamento2: "Feijão Carioca",
        guarnicao: "Farofa de Cuscuz",
        saladaDoDia: "Salada Crua",
        sobremesa: "Doce",
        sucoNatural: "Suco de Polpa de Cajá",
        valorCalorico: "950",
    },
];

const diasUteis = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

function inicioDaSemana(data) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const deslocamento = (inicio.getDay() + 6) % 7;
    inicio.setDate(inicio.getDate() - deslocamento);
    return inicio;
}

export function dataIsoLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export function dataDeIsoLocal(iso) {
    const [ano, mes, dia] = iso.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

export function obterDiasUteisDaSemana(dataBase = new Date()) {
    const segunda = inicioDaSemana(dataBase);
    return diasUteis.map((nome, indice) => {
        const data = new Date(segunda);
        data.setDate(segunda.getDate() + indice);
        return { nome, data: dataIsoLocal(data) };
    });
}

export function formatarDataCardapio(iso) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(dataDeIsoLocal(iso));
}

export function formatarIntervaloSemana(dias) {
    if (!dias.length) return "";
    const primeiro = dataDeIsoLocal(dias[0].data);
    const ultimo = dataDeIsoLocal(dias[dias.length - 1].data);
    const formatadorDia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
    const formatadorMesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
    if (primeiro.getMonth() === ultimo.getMonth() && primeiro.getFullYear() === ultimo.getFullYear()) {
        return `${formatadorDia.format(primeiro)} a ${formatadorDia.format(ultimo)} de ${formatadorMesAno.format(ultimo)}`;
    }
    const formatadorDiaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });
    return `${formatadorDiaMes.format(primeiro)} a ${formatadorDiaMes.format(ultimo)} de ${ultimo.getFullYear()}`;
}

export function filtrarHistoricoCardapios(historico, filtros) {
    const pesquisa = filtros.pesquisa.trim().toLocaleLowerCase("pt-BR");
    return historico.filter((cardapio) => {
        if (filtros.dataInicial && cardapio.data < filtros.dataInicial) return false;
        if (filtros.dataFinal && cardapio.data > filtros.dataFinal) return false;
        if (!pesquisa) return true;
        return camposCardapio.some(({ key }) =>
            String(cardapio[key] ?? "").toLocaleLowerCase("pt-BR").includes(pesquisa),
        );
    });
}

export function resumirCardapio(cardapio) {
    return [cardapio.pratoProteico, cardapio.opcaoProteica, cardapio.acompanhamento1,
        cardapio.acompanhamento2, cardapio.guarnicao, cardapio.saladaDoDia,
        cardapio.sobremesa, cardapio.sucoNatural].filter(Boolean).join(", ");
}
