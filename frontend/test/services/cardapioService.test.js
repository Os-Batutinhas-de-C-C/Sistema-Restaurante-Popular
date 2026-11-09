import { describe, expect, it } from "@jest/globals";
import {
    filtrarCardapiosPorIntervalo,
    obterIntervaloSemanaAtual,
} from "../../src/services/cardapioService";

describe("cardapioService", () => {
    it("cria cinco dias pendentes quando a semana selecionada não possui cardápio", () => {
        const intervalo = obterIntervaloSemanaAtual("2026-11-09");
        const cardapios = filtrarCardapiosPorIntervalo([], intervalo);

        expect(cardapios).toHaveLength(5);
        expect(cardapios.map(({ nome }) => nome)).toEqual([
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
        ]);
        expect(cardapios.every(({ refeicao }) => refeicao === null)).toBe(true);
    });

    it("mantém os itens existentes da semana selecionada", () => {
        const intervalo = obterIntervaloSemanaAtual("2026-11-09");
        const refeicao = { idRefeicao: 1, proteina: "Frango", calorias: 500 };
        const cardapios = filtrarCardapiosPorIntervalo(
            [{ dia: "2026-11-10", nome: "Terça-feira", data: "10/11/2026", refeicao }],
            intervalo,
        );

        expect(cardapios).toHaveLength(1);
        expect(cardapios[0].refeicao).toEqual(refeicao);
    });
});
