import {
    dataDeIsoLocal,
    dataIsoLocal,
    listarSemanasApi,
    obterSegundaIso,
    salvarRefeicaoDiaApi,
    transformarHistorico,
} from "./cardapiosApiService";

const diasUteis = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

export { dataIsoLocal, dataDeIsoLocal };

export function obterDiasUteisDaSemana(dataBase = new Date()) {
    const segunda = dataDeIsoLocal(obterSegundaIso(dataBase));
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

export async function listarHistoricoCardapios(options = {}) {
    const semanas = await listarSemanasApi(options);
    return semanas.flatMap(transformarHistorico)
        .filter((cardapio) => camposCardapio.some(({ key }) => String(cardapio[key] ?? "").trim()));
}

export async function salvarCardapioDia(data, valores, options = {}) {
    return salvarRefeicaoDiaApi(data, valores, options);
}

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
