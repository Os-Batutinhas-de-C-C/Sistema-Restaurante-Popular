import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { listarHistoricoCardapios, salvarCardapioDia, selecionarSugestaoCardapio } from "../../src/services/gerenciamentoCardapioService";
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
    listarHistoricoCardapios: jest.fn(),
    salvarCardapioDia: jest.fn(),
    selecionarSugestaoCardapio: jest.fn(),
}));

const refeicao = {
    idRefeicao: 41,
    pratoProteico: "Frango com legumes",
    opcaoProteica: "Omelete",
    acompanhamento1: "Arroz",
    acompanhamento2: "Feijão",
    guarnicao: "Farofa",
    saladaDoDia: "Salada verde",
    sobremesa: "Fruta",
    sucoNatural: "Suco de caju",
    valorCalorico: "850",
};

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
        listarHistoricoCardapios.mockResolvedValue([refeicao]);
        selecionarSugestaoCardapio.mockReturnValue(refeicao);
        salvarCardapioDia.mockResolvedValue(semanaVazia());
    });

    it("preenche a sugestão sem trocar o dia nem salvar até a ação explícita", async () => {
        render(<GerenciarCardapio dataSolicitada="2026-11-09" />);
        const gerar = await screen.findByRole("button", { name: "Gerar Cardápio" });
        await waitFor(() => expect(gerar).toBeEnabled());

        fireEvent.click(gerar);

        expect(await screen.findByRole("textbox", { name: "Prato Proteico" })).toHaveValue("Frango com legumes");
        expect(screen.getByRole("spinbutton", { name: "Valor Calórico Estimado (kcal)" })).toHaveValue(850);
        expect(screen.getByTestId("dia-selecionado")).toHaveTextContent("2026-11-09");
        expect(salvarCardapioDia).not.toHaveBeenCalled();

        fireEvent.change(screen.getByRole("textbox", { name: "Prato Proteico" }), {
            target: { value: "Frango revisado" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Salvar Cardápio" }));
        await waitFor(() => expect(salvarCardapioDia).toHaveBeenCalledWith(
            "2026-11-09",
            expect.objectContaining({ pratoProteico: "Frango revisado" }),
        ));
    });

    it("preserva os dados atuais e informa quando não há sugestão", async () => {
        selecionarSugestaoCardapio.mockReturnValue(null);
        render(<GerenciarCardapio dataSolicitada="2026-11-09" />);
        const campo = await screen.findByRole("textbox", { name: "Prato Proteico" });
        await waitFor(() => expect(screen.getByRole("button", { name: "Gerar Cardápio" })).toBeEnabled());
        fireEvent.change(campo, { target: { value: "Rascunho atual" } });

        fireEvent.click(screen.getByRole("button", { name: "Gerar Cardápio" }));

        expect(await screen.findByText("Não há sugestões disponíveis no histórico para este dia.")).toBeInTheDocument();
        expect(campo).toHaveValue("Rascunho atual");
        expect(salvarCardapioDia).not.toHaveBeenCalled();
    });

    it("mostra falha da consulta sem apagar os campos preenchidos", async () => {
        listarHistoricoCardapios.mockRejectedValue(new Error("Falha de conexão"));
        render(<GerenciarCardapio dataSolicitada="2026-11-09" />);
        const campo = await screen.findByRole("textbox", { name: "Prato Proteico" });
        await waitFor(() => expect(screen.getByRole("button", { name: "Gerar Cardápio" })).toBeEnabled());
        fireEvent.change(campo, { target: { value: "Rascunho atual" } });

        fireEvent.click(screen.getByRole("button", { name: "Gerar Cardápio" }));

        expect(await screen.findByText("Falha de conexão")).toBeInTheDocument();
        expect(campo).toHaveValue("Rascunho atual");
    });

    it("exibe carregamento e desabilita as ações conflitantes enquanto busca sugestões", async () => {
        let resolverHistorico;
        listarHistoricoCardapios.mockImplementation(() => new Promise((resolve) => {
            resolverHistorico = resolve;
        }));
        render(<GerenciarCardapio dataSolicitada="2026-11-09" />);
        const gerar = await screen.findByRole("button", { name: "Gerar Cardápio" });
        await waitFor(() => expect(gerar).toBeEnabled());

        fireEvent.click(gerar);

        expect(await screen.findByRole("button", { name: "Gerando..." })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Salvar Cardápio" })).toBeDisabled();
        await act(async () => resolverHistorico([refeicao]));
        expect(await screen.findByRole("button", { name: "Gerar Cardápio" })).toBeEnabled();
    });
});
