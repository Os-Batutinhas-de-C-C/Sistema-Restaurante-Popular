import { describe, expect, it } from "@jest/globals";
import {
    formatarDataEstoque,
    formatarQuantidade,
} from "../../src/services/estoqueService";

describe("estoqueService", () => {
    it("formata datas válidas e rejeita datas inválidas", () => {
        expect(formatarDataEstoque("2026-11-09")).toBe("09/11/2026");
        expect(formatarDataEstoque("sem data")).toBe("—");
    });

    it("formata quantidades com locale e valores ausentes", () => {
        expect(formatarQuantidade(1234.5)).toBe("1.234,5");
        expect(formatarQuantidade("")).toBe("—");
        expect(formatarQuantidade("abc")).toBe("abc");
    });
});
