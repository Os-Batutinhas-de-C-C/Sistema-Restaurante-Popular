import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DialogRelatorio from "../../src/components/painel-nutricionista-relatorios/DialogRelatorio";

describe("DialogRelatorio", () => {
    it("permite editar e salvar fichas e desperdício", async () => {
        const onSave = jest.fn().mockResolvedValue(undefined);
        const relatorio = {
            id: "2026-11-11",
            data: "2026-11-11",
            dia: "Quarta-feira",
            dataFormatada: "11/11/2026",
            refeicao: "Refeição",
            fichas: 20,
            desperdicioKg: 2,
        };

        render(
            <DialogRelatorio
                relatorio={relatorio}
                onClose={() => {}}
                onSave={onSave}
            />,
        );

        const fichas = screen.getByRole("spinbutton", { name: "Fichas" });
        expect(fichas).toBeEnabled();
        fireEvent.change(fichas, {
            target: { value: "25" },
        });
        fireEvent.change(screen.getByRole("spinbutton", { name: "Desperdício (kg)" }), {
            target: { value: "3.5" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith("2026-11-11", {
                fichasVendidas: "25",
                desperdicioKg: "3.5",
            });
        });
    });
});
