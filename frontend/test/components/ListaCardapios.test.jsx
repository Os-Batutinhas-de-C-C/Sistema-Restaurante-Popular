import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import ListaCardapios from "../../src/components/painelNutricionistaCardapio/ListaCardapios/ListaCardapios";

describe("ListaCardapios", () => {
    it("exibe os cinco dias pendentes sem botão adicional no cabeçalho", () => {
        const cardapios = [
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
        ].map((nome, index) => ({
            nome,
            dia: `2026-11-${String(9 + index).padStart(2, "0")}`,
            data: `${String(9 + index).padStart(2, "0")}/11/2026`,
            refeicao: null,
        }));

        render(
            <ListaCardapios
                cardapios={cardapios}
                intervaloSelecionado={{ from: new Date(2026, 10, 9), to: new Date(2026, 10, 15) }}
                onSelectRange={() => {}}
                onPreviousRange={() => {}}
                onNextRange={() => {}}
                onEdit={() => {}}
                onView={() => {}}
            />,
        );

        expect(screen.getAllByText("Pendente")).toHaveLength(5);
        expect(screen.queryByRole("button", { name: /adicionar cardápio/i })).not.toBeInTheDocument();
    });
});
