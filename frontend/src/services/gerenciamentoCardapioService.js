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

const camposObrigatoriosParaSugestao = camposCardapio.map(({ key }) => key);
const camposComposicao = camposCardapio
    .filter(({ key }) => key !== "valorCalorico")
    .map(({ key }) => key);

function cardapioCompleto(cardapio) {
    return cardapio && camposObrigatoriosParaSugestao.every((campo) =>
        String(cardapio[campo] ?? "").trim() !== "",
    );
}

function chaveComposicao(cardapio) {
    if (cardapio.idRefeicao != null) return `id:${cardapio.idRefeicao}`;
    return `composicao:${camposObrigatoriosParaSugestao
        .map((campo) => String(cardapio[campo] ?? "").trim().toLocaleLowerCase("pt-BR"))
        .join("|")}`;
}

function chaveCombinacaoSemanal(cardapio) {
    return camposComposicao
        .map((campo) => String(cardapio[campo] ?? "").trim().toLocaleLowerCase("pt-BR"))
        .join("\u001f");
}

export function selecionarSugestoesSemana(historico, aleatorio = Math.random) {
    const combinacoesVistas = new Set();
    const combinacoesUnicas = (historico ?? []).filter((cardapio) => {
        if (!cardapioCompleto(cardapio)) return false;
        const chave = chaveCombinacaoSemanal(cardapio);
        if (combinacoesVistas.has(chave)) return false;
        combinacoesVistas.add(chave);
        return true;
    });

    if (combinacoesUnicas.length < 5) return null;

    const embaralhadas = [...combinacoesUnicas];
    for (let indice = embaralhadas.length - 1; indice > 0; indice -= 1) {
        const sorteado = Math.min(
            Math.max(Math.floor(aleatorio() * (indice + 1)), 0),
            indice,
        );
        [embaralhadas[indice], embaralhadas[sorteado]] = [embaralhadas[sorteado], embaralhadas[indice]];
    }

    return embaralhadas.slice(0, 5).map((cardapio) => ({ ...cardapio }));
}

export function selecionarSugestaoCardapio(
    historico,
    cardapiosSemana,
    dataSelecionada,
    ultimaSugestao,
    aleatorio = Math.random,
) {
    const usadosNaSemana = new Set(
        Object.entries(cardapiosSemana ?? {})
            .filter(([data, cardapio]) => data !== dataSelecionada && cardapioCompleto(cardapio))
            .map(([, cardapio]) => chaveComposicao(cardapio)),
    );
    const vistos = new Set();
    const opcoes = (historico ?? []).filter((cardapio) => {
        if (!cardapioCompleto(cardapio)) return false;
        const chave = chaveComposicao(cardapio);
        if (usadosNaSemana.has(chave) || vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
    });

    const chaveAnterior = ultimaSugestao == null
        ? null
        : chaveComposicao(typeof ultimaSugestao === "object" ? ultimaSugestao : { idRefeicao: ultimaSugestao });
    const opcoesNovas = chaveAnterior == null
        ? opcoes
        : opcoes.filter((cardapio) => chaveComposicao(cardapio) !== chaveAnterior);
    const elegiveis = opcoesNovas.length ? opcoesNovas : opcoes;
    if (!elegiveis.length) return null;

    const indice = Math.min(
        Math.max(Math.floor(aleatorio() * elegiveis.length), 0),
        elegiveis.length - 1,
    );
    return { ...elegiveis[indice] };
}

export async function listarHistoricoCardapios(options = {}) {
    const semanas = await listarSemanasApi(options);
    return semanas.flatMap(transformarHistorico)
        .filter((cardapio) => camposCardapio.some(({ key }) => String(cardapio[key] ?? "").trim()));
}

export async function salvarCardapioDia(data, valores, options = {}) {
    return salvarRefeicaoDiaApi(data, valores, options);
}

export const cardapioVazio = Object.fromEntries(camposCardapio.map(({ key }) => [key, ""]));
