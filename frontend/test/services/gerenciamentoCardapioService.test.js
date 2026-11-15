import { describe, expect, it } from "@jest/globals";
import {
    cardapioVazio,
    filtrarHistoricoCardapios,
    formatarIntervaloSemana,
    obterDiasUteisDaSemana,
    resumirCardapio,
} from "../../src/services/gerenciamentoCardapioService";

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
});
