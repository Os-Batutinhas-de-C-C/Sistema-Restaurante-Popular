import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { apiRequest } from "../../src/services/apiClient";
import {
    dataDeIsoLocal,
    dataIsoLocal,
    mapearRefeicao,
    mapearSemanaParaDias,
    obterSegundaIso,
    salvarCardapioSemanaApi,
    salvarMetricasDiaApi,
    transformarHistorico,
} from "../../src/services/cardapiosApiService";

jest.mock("../../src/services/apiClient", () => ({
    ...jest.requireActual("../../src/services/apiClient"),
    apiRequest: jest.fn(),
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
    fichasVendidas: [11, 12, 13, 14, 15],
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
    beforeEach(() => jest.clearAllMocks());

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
            idRefeicao: 1,
            dia: "Segunda-feira",
            data: "2026-11-09",
            pratoProteico: "Frango",
        });
    });

    it("cria uma semana com cinco referências históricas em uma única gravação", async () => {
        const refeicoes = Array.from({ length: 5 }, (_, indice) => ({ idRefeicao: indice + 20 }));
        const resposta = { ...semana, cardapio: refeicoes };
        apiRequest
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: resposta });

        await expect(salvarCardapioSemanaApi("2026-11-09", refeicoes)).resolves.toEqual(resposta);

        expect(apiRequest).toHaveBeenCalledTimes(2);
        expect(apiRequest).toHaveBeenNthCalledWith(2, "/semanas", expect.objectContaining({
            method: "POST",
            body: expect.objectContaining({
                data: "2026-11-09",
                cardapio: refeicoes,
                desperdicio: [],
                fichasVendidas: [],
            }),
        }));
    });

    it("atualiza a semana em uma gravação e preserva desperdício e fichas existentes", async () => {
        const refeicoes = Array.from({ length: 5 }, (_, indice) => ({ idRefeicao: indice + 20 }));
        const resposta = { ...semana, cardapio: refeicoes };
        apiRequest
            .mockResolvedValueOnce({ data: [semana] })
            .mockResolvedValueOnce({ data: resposta });

        await expect(salvarCardapioSemanaApi("2026-11-09", refeicoes)).resolves.toEqual(resposta);

        expect(apiRequest).toHaveBeenCalledTimes(2);
        expect(apiRequest).toHaveBeenNthCalledWith(2, "/semanas/2026-11-09", expect.objectContaining({
            method: "PUT",
            body: expect.objectContaining({
                cardapio: refeicoes,
                desperdicio: semana.desperdicio,
                fichasVendidas: semana.fichasVendidas,
            }),
        }));
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
