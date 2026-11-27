import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import ListaCardapios from "../../src/components/painelNutricionistaCardapio/ListaCardapios/ListaCardapios";

describe("ListaCardapios", () => {
    it("exibe os cinco dias pendentes e oferece geração na semana selecionada", () => {
        const onGenerateWeek = jest.fn();
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
                semanaValida
                onGenerateWeek={onGenerateWeek}
            />,
        );

        expect(screen.getAllByText("Pendente")).toHaveLength(5);
        const gerar = screen.getByRole("button", { name: "Gerar cardápio da semana" });
        expect(gerar).toBeEnabled();
        fireEvent.click(gerar);
        expect(onGenerateWeek).toHaveBeenCalledTimes(1);
    });

    it("mantém a geração na lista semanal sem seção ou controles de prévia", () => {
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
                semanaValida
                onGenerateWeek={() => {}}
            />,
        );

        expect(screen.getByRole("button", { name: "Gerar cardápio da semana" })).toBeInTheDocument();
        expect(screen.queryByText("Prévia gerada")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Salvar semana" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Descartar" })).not.toBeInTheDocument();
    });
});
