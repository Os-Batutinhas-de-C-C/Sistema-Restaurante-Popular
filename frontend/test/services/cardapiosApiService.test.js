import { describe, expect, it } from "@jest/globals";
import {
    dataDeIsoLocal,
    dataIsoLocal,
    mapearRefeicao,
    mapearSemanaParaDias,
    obterSegundaIso,
    transformarHistorico,
} from "../../src/services/cardapiosApiService";

const semana = {
    data: "2026-11-09",
    desperdicio: [1, 2, 3, 4, 5],
    cardapio: [
        { idRefeicao: 1, proteina: "Frango", calorias: 500 },
        null,
        null,
        null,
        null,
    ],
};

describe("cardapiosApiService", () => {
    it("converte datas locais e encontra a segunda-feira", () => {
        expect(dataIsoLocal(dataDeIsoLocal("2026-11-11"))).toBe("2026-11-11");
        expect(obterSegundaIso(new Date(2026, 10, 11))).toBe("2026-11-09");
        expect(obterSegundaIso(new Date(2026, 10, 15))).toBe("2026-11-09");
    });

    it("mapeia refeição e os cinco dias da semana", () => {
        expect(mapearRefeicao(semana.cardapio[0])).toMatchObject({
            idRefeicao: 1,
            pratoProteico: "Frango",
            valorCalorico: "500",
        });
        expect(mapearRefeicao(null)).toBeNull();
        expect(mapearSemanaParaDias(semana)).toHaveLength(5);
        expect(mapearSemanaParaDias(semana)[0].nome).toBe("Segunda-feira");
    });

    it("transforma histórico em linhas editáveis", () => {
        expect(transformarHistorico(semana)[0]).toMatchObject({
            dia: "Segunda-feira",
            data: "2026-11-09",
            pratoProteico: "Frango",
        });
    });
});
