import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import ResumoMetricas from "../../src/components/painelNutricionista/ResumoMetricas/ResumoMetricas";

describe("ResumoMetricas", () => {
    it("apresenta entregues/capacidade, percentual e barra sem texto duplicado de capacidade", () => {
        render(
            <ResumoMetricas
                dadosDashboard={{
                    fichasEntregues: 77,
                    fichasTotais: 300,
                    fichasRestantes: 223,
                    fichasCarregando: false,
                    desperdicioKg: null,
                }}
            />,
        );

        expect(screen.getByTestId("fichas-entregues")).toHaveTextContent("77");
        expect(screen.getByTestId("fichas-capacidade")).toHaveTextContent("300");
        expect(screen.getByText("26% da capacidade diária")).toBeInTheDocument();
        expect(screen.queryByText("Capacidade diária: 300")).not.toBeInTheDocument();
        expect(screen.queryByText(/Restam/)).not.toBeInTheDocument();
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Capacidade diária de fichas entregues");
    });
});
