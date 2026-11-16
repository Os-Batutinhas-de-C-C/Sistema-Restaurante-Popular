import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import TabelaRelatorio from "../../src/components/painel-nutricionista-relatorios/TabelaRelatorio";

function dataIso(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

describe("TabelaRelatorio", () => {
    it("permite editar o dia atual e dias sem dados, mas oculta para dias anteriores preenchidos", () => {
        const hoje = new Date();
        const diaAnterior = new Date(hoje);
        diaAnterior.setDate(hoje.getDate() - 1);
        const relatorios = [
            {
                id: "anterior-preenchido",
                data: dataIso(diaAnterior),
                dia: "Dia anterior preenchido",
                dataFormatada: "data anterior",
                refeicao: "Refeição",
                fichas: 20,
                desperdicioKg: 2,
                editavel: true,
            },
            {
                id: "anterior-vazio",
                data: dataIso(diaAnterior),
                dia: "Dia anterior vazio",
                dataFormatada: "data anterior",
                refeicao: "Refeição",
                fichas: null,
                desperdicioKg: null,
                editavel: true,
            },
            {
                id: "hoje",
                data: dataIso(hoje),
                dia: "Hoje",
                dataFormatada: "data atual",
                refeicao: "Refeição",
                fichas: 20,
                desperdicioKg: 2,
                editavel: true,
            },
        ];

        render(<TabelaRelatorio relatorios={relatorios} onEditar={() => {}} />);

        expect(screen.queryByRole("button", { name: "Editar dados de Dia anterior preenchido" }))
            .not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Editar dados de Dia anterior vazio" }))
            .toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Editar dados de Hoje" }))
            .toBeInTheDocument();
    });
});
