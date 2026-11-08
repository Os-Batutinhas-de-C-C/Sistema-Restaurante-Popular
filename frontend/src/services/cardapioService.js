import { listarSemanasApi, mapearSemanaParaDias, dataDeIsoLocal } from "./cardapiosApiService";

function inicioDaSemana(data) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const diasARecuar = (inicio.getDay() + 6) % 7;
    inicio.setDate(inicio.getDate() - diasARecuar);
    return inicio;
}

export function obterIntervaloSemanaAtual(dataReferencia) {
    const from = inicioDaSemana(dataReferencia ? dataDeIsoLocal(dataReferencia) : new Date());
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    return { from, to };
}

export async function listarDadosCardapio(options = {}) {
    const semanas = await listarSemanasApi(options);
    return {
        semanas,
        cardapios: semanas.flatMap(mapearSemanaParaDias),
    };
}

export function filtrarCardapiosPorIntervalo(cardapios, intervalo) {
    if (!intervalo?.from || !intervalo?.to) return [];
    const inicio = new Date(intervalo.from);
    const fim = new Date(intervalo.to);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    return cardapios.filter(({ dia }) => {
        const dataDoCardapio = dataDeIsoLocal(dia);
        return dataDoCardapio >= inicio && dataDoCardapio <= fim;
    });
}

export function obterGraficosSemana(semanas, intervalo, fichasDia = null, dataReferencia = fichasDia?.data) {
    const segunda = inicioDaSemana(intervalo?.from ?? new Date());
    const segundaIso = `${segunda.getFullYear()}-${String(segunda.getMonth() + 1).padStart(2, "0")}-${String(segunda.getDate()).padStart(2, "0")}`;
    const semana = semanas.find((item) => item.data === segundaIso);
    const cincoValores = (valores) => Array.from({ length: 5 }, (_, index) => Number(valores?.[index]) || 0);
    const fichas = cincoValores(semana?.fichasVendidas);
    if (dataReferencia) {
        const diaAtual = dataDeIsoLocal(dataReferencia);
        const segundaAtual = inicioDaSemana(diaAtual);
        const indiceDia = diaAtual.getDay() - 1;
        if (segunda.getTime() === segundaAtual.getTime() && indiceDia >= 0 && indiceDia < 5) {
            fichas[indiceDia] = fichasDia?.data === dataReferencia ? fichasDia.entregues : null;
        }
    }
    return {
        fichas,
        capacidadeFichas: fichasDia?.capacidade,
        desperdicio: cincoValores(semana?.desperdicio),
    };
}
