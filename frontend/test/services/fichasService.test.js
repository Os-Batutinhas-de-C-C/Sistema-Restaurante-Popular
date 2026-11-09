import { describe, expect, it } from "@jest/globals";
import {
    diaUtilFichas,
    percentualFichas,
    validarFichasDia,
} from "../../src/services/fichasService";

describe("fichasService", () => {
    it("identifica dias úteis e finais de semana", () => {
        expect(diaUtilFichas("2026-11-09")).toBe(true);
        expect(diaUtilFichas("2026-11-08")).toBe(false);
    });

    it("calcula o percentual sem ultrapassar 100%", () => {
        expect(percentualFichas({ entregues: 77, capacidade: 300 })).toBeCloseTo(25.666, 2);
        expect(percentualFichas({ entregues: 400, capacidade: 300 })).toBe(100);
        expect(percentualFichas(null)).toBe(0);
    });

    it("valida a contagem e a permissão de adicionar fichas", () => {
        expect(validarFichasDia({
            data: "2026-11-09",
            entregues: 77,
            capacidade: 300,
            restantes: 223,
            permiteAdicionar: true,
        })).toMatchObject({ entregues: 77, capacidade: 300 });

        expect(() => validarFichasDia({
            data: "2026-11-09",
            entregues: 77,
            capacidade: 300,
            restantes: 222,
            permiteAdicionar: true,
        })).toThrow("contagem de fichas inválida");
    });
});
