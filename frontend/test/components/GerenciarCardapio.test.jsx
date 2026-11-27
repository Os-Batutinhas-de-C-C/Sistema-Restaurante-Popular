import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { salvarCardapioDia } from "../../src/services/gerenciamentoCardapioService";
import { obterSemanaApi } from "../../src/services/cardapiosApiService";
import GerenciarCardapio from "../../src/components/painelNutricionistaGerenciarCardapio/GerenciarCardapio";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("../../src/components/NavbarPainel/NavbarPainel", () => () => null);
jest.mock("../../src/components/painelNutricionistaGerenciarCardapio/ModalHistorico/ModalHistorico", () => () => null);
jest.mock("../../src/components/painelNutricionistaGerenciarCardapio/NavegacaoDias/NavegacaoDias", () => {
    const React = require("react");
    return function NavegacaoDiasTeste({ dias, dataSelecionada }) {
        return React.createElement("output", { "data-testid": "dia-selecionado" }, dataSelecionada ?? dias[0]?.data);
    };
});
jest.mock("../../src/services/cardapiosApiService", () => ({
    ...jest.requireActual("../../src/services/cardapiosApiService"),
    obterSemanaApi: jest.fn(),
}));
jest.mock("../../src/services/gerenciamentoCardapioService", () => ({
    ...jest.requireActual("../../src/services/gerenciamentoCardapioService"),
    salvarCardapioDia: jest.fn(),
}));

const semanaVazia = () => ({
    data: "2026-11-09",
    desperdicio: [],
    fichasVendidas: [],
    cardapio: Array(5).fill(null),
});

describe("GerenciarCardapio", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        obterSemanaApi.mockResolvedValue(semanaVazia());
        salvarCardapioDia.mockResolvedValue(semanaVazia());
    });

    it("remove a geração diária e mantém edição e gravação manual", async () => {
        render(<GerenciarCardapio dataSolicitada="2026-11-09" />);
        const campo = await screen.findByRole("textbox", { name: "Prato Proteico" });
        expect(screen.getByTestId("dia-selecionado")).toHaveTextContent("2026-11-09");
        expect(screen.queryByRole("button", { name: /gerar cardápio/i })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Copiar Do Histórico" })).toBeInTheDocument();

        fireEvent.change(campo, { target: { value: "Frango revisado" } });
        fireEvent.click(screen.getByRole("button", { name: "Salvar Cardápio" }));
        await waitFor(() => expect(salvarCardapioDia).toHaveBeenCalledWith(
            "2026-11-09",
            expect.objectContaining({ pratoProteico: "Frango revisado" }),
        ));
    });
});
