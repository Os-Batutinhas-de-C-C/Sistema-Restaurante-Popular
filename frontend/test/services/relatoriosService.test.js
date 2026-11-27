import { describe, expect, it } from "@jest/globals";
import {
    calcularIndicadores,
    mapearSemanasParaRelatorios,
    obterDadosDosGraficos,
    obterPeriodoInicial,
} from "../../src/services/relatoriosService";

describe("relatoriosService", () => {
    it("mapeia os dados disponíveis da API semanal sem inventar métricas ausentes", () => {
        const relatorios = mapearSemanasParaRelatorios([{
            data: "2026-11-09",
            fichasVendidas: [20],
            desperdicio: [2.5],
            cardapio: [
                { proteina: "Frango", acompanhamento1: "Arroz" },
                null,
                null,
                null,
                null,
            ],
        }]);

        expect(relatorios).toHaveLength(5);
        expect(relatorios[0]).toMatchObject({
            id: "2026-11-09",
            refeicao: "Frango, Arroz",
            fichas: 20,
            desperdicioKg: 2.5,
            sobrasKg: null,
            satisfacao: null,
        });
        expect(relatorios[1]).toMatchObject({
            refeicao: "Pendente",
            fichas: null,
            desperdicioKg: null,
            sobrasKg: null,
            satisfacao: null,
        });
    });

    it("começa sem limitar o período aos dados de exemplo", () => {
        expect(obterPeriodoInicial()).toBeUndefined();
    });

    it("representa indicadores sem dados como indisponíveis", () => {
        expect(calcularIndicadores([])).toEqual({
            totalFichas: null,
            mediaDesperdicioKg: null,
            mediaSobrasKg: null,
            mediaSatisfacao: null,
        });
    });

    it("não transforma medições semanais ausentes em zeros nos gráficos", () => {
        expect(obterDadosDosGraficos([{
            data: "2026-11-09",
            fichas: null,
            desperdicioKg: null,
        }])).toEqual({
            fichas: [null, null, null, null, null],
            desperdicio: [null, null, null, null, null],
        });
    });
});
