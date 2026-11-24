import { describe, expect, it } from "@jest/globals";
import {
    cardapioVazio,
    filtrarHistoricoCardapios,
    formatarIntervaloSemana,
    obterDiasUteisDaSemana,
    resumirCardapio,
    selecionarSugestaoCardapio,
} from "../../src/services/gerenciamentoCardapioService";

const refeicao = (idRefeicao, pratoProteico = `Prato ${idRefeicao}`) => ({
    idRefeicao,
    pratoProteico,
    opcaoProteica: "Omelete",
    acompanhamento1: "Arroz",
    acompanhamento2: "Feijão",
    guarnicao: "Farofa",
    saladaDoDia: "Salada",
    sobremesa: "Fruta",
    sucoNatural: "Suco",
    valorCalorico: "850",
});

describe("gerenciamentoCardapioService", () => {
    it("calcula dias úteis e intervalo de semana", () => {
        expect(obterDiasUteisDaSemana(new Date(2026, 10, 11))).toHaveLength(5);
        expect(formatarIntervaloSemana(obterDiasUteisDaSemana(new Date(2026, 10, 11))))
            .toContain("09 a 13");
    });

    it("filtra histórico por texto e data", () => {
        const historico = [
            { data: "2026-11-09", pratoProteico: "Frango grelhado" },
            { data: "2026-11-10", pratoProteico: "Peixe" },
        ];
        expect(filtrarHistoricoCardapios(historico, {
            pesquisa: "frango", dataInicial: "", dataFinal: "",
        })).toHaveLength(1);
    });

    it("resume cardápio e fornece modelo vazio", () => {
        expect(resumirCardapio({ pratoProteico: "Frango", sobremesa: "Fruta" }))
            .toBe("Frango, Fruta");
        expect(Object.keys(cardapioVazio)).toHaveLength(9);
    });

    it("retorna null para histórico vazio ou sem composição completa", () => {
        expect(selecionarSugestaoCardapio([], {}, "2026-11-09")).toBeNull();
        expect(selecionarSugestaoCardapio([
            { ...refeicao(1), sucoNatural: "" },
        ], {}, "2026-11-09")).toBeNull();
    });

    it("evita repetir refeição já usada em outro dia da semana", () => {
        const resultado = selecionarSugestaoCardapio(
            [refeicao(1), refeicao(2)],
            { "2026-11-09": refeicao(1) },
            "2026-11-10",
            null,
            () => 0,
        );
        expect(resultado.idRefeicao).toBe(2);
    });

    it("permite reutilizar a refeição do próprio dia e escolher outra sugestão", () => {
        const historico = [refeicao(1), refeicao(2)];
        const resultado = selecionarSugestaoCardapio(
            historico,
            { "2026-11-09": refeicao(1) },
            "2026-11-09",
            1,
            () => 0,
        );
        expect(resultado.idRefeicao).toBe(2);
        expect(historico).toHaveLength(2);
    });

    it("preserva todos os campos da composição incluindo calorias", () => {
        expect(selecionarSugestaoCardapio([refeicao(8)], {}, "2026-11-09", null, () => 0))
            .toMatchObject(refeicao(8));
    });
});
