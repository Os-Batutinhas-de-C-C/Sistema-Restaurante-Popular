import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { apiRequest } from "../../src/services/apiClient";
import {
    dataDeIsoLocal,
    dataIsoLocal,
    mapearRefeicao,
    mapearSemanaParaDias,
    obterSegundaIso,
    salvarMetricasDiaApi,
    transformarHistorico,
} from "../../src/services/cardapiosApiService";

jest.mock("../../src/services/apiClient", () => ({
    apiRequest: jest.fn(),
    ApiError: class ApiError extends Error {
        constructor(message, options = {}) {
            super(message);
            this.code = options.code;
        }
    },
}));

const semana = {
    data: "2026-11-09",
    desperdicio: [1, 2, 3, 4, 5],
    fichasVendidas: [20, 21, 22, 23, 24],
    cardapio: [
        { idRefeicao: 1, proteina: "Frango", calorias: 500 },
        null,
        null,
        null,
        null,
    ],
};

beforeEach(() => {
    apiRequest.mockReset();
});

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

    it("salva as métricas do dia sem alterar as métricas dos outros dias", async () => {
        apiRequest
            .mockResolvedValueOnce({ data: [semana] })
            .mockResolvedValueOnce({ data: semana });

        await salvarMetricasDiaApi("2026-11-11", {
            desperdicioKg: 3.5,
            fichasVendidas: 99,
        });

        expect(apiRequest).toHaveBeenNthCalledWith(2, "/semanas/2026-11-09", expect.objectContaining({
            method: "PUT",
            body: {
                desperdicio: [1, 2, 3.5, 4, 5],
                fichasVendidas: [20, 21, 99, 23, 24],
                cardapio: [{ idRefeicao: 1 }, null, null, null, null],
            },
        }));
    });

    it("não envia fichas quando apenas o desperdício foi editado", async () => {
        apiRequest
            .mockResolvedValueOnce({ data: [semana] })
            .mockResolvedValueOnce({ data: semana });

        await salvarMetricasDiaApi("2026-11-11", { desperdicioKg: 3.5 });

        expect(apiRequest.mock.calls[1][1].body).not.toHaveProperty("fichasVendidas");
    });
});
