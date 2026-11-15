import { describe, expect, it, jest } from "@jest/globals";
import { apiRequest } from "../../src/services/apiClient";
import { obterPeriodoPadrao as obterPeriodoMensagens } from "../../src/services/mensagensService";
import {
    listarNoticiasPorPeriodo,
    obterPeriodoPadrao as obterPeriodoNoticias,
} from "../../src/services/noticiasService";
import { perfilParaSessao } from "../../src/services/perfilService";
import { formatarData, formatarDataHora, obterDuracaoNoticia, resumirTexto } from "../../src/utils/painelFormatadores";

jest.mock("../../src/services/apiClient", () => ({
    apiRequest: jest.fn(),
    ApiError: class ApiError extends Error {},
}));

describe("mensagens, notícias, perfil e formatadores", () => {
    it("retorna períodos semanais válidos", () => {
        const mensagens = obterPeriodoMensagens();
        const noticias = obterPeriodoNoticias();
        expect(mensagens.to.getTime()).toBeGreaterThan(mensagens.from.getTime());
        expect(noticias.from.getDay()).toBe(1);
    });

    it("filtra notícias por período e ordena as mais recentes", async () => {
        apiRequest.mockResolvedValue({
            data: [
                { idMensagem: 1, data: "2026-11-09", horario: "10:00:00", assunto: "Antiga", texto: "x", duracao: 1 },
                { idMensagem: 2, data: "2026-11-10", horario: "11:00:00", assunto: "Nova", texto: "y", duracao: 2 },
            ],
        });
        const result = await listarNoticiasPorPeriodo({
            from: new Date(2026, 10, 9), to: new Date(2026, 10, 10),
        });
        expect(result[0].titulo).toBe("Nova");
        apiRequest.mockReset();
    });

    it("converte perfil e aplica os formatadores", () => {
        expect(perfilParaSessao({
            idUsuario: 1, nome: "Pedro", emailRecuperacao: "p@x.test", perfil: "Caixa",
        }).email).toBe("p@x.test");
        expect(formatarData("2026-11-09")).toContain("2026");
        expect(formatarDataHora("2026-11-09", "10:00")).toContain("10:00");
        expect(resumirTexto("abcdefgh", 4)).toBe("abcd...");
        expect(obterDuracaoNoticia({ duracaoHoras: 2 })).toBe("2h");
    });
});
