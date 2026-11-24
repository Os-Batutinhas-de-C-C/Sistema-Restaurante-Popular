import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccessibilityTools from "@/components/AccessibilityTools/AccessibilityTools";

jest.mock("next/script", () => {
    const React = require("react");
    return function MockScript({ onLoad, onError, src, strategy }) {
        return React.createElement(
            "div",
            { "data-testid": "vlibras-script", "data-src": src, "data-strategy": strategy },
            React.createElement("button", { type: "button", onClick: onLoad }, "Simular carregamento VLibras"),
            React.createElement("button", { type: "button", onClick: onError }, "Simular falha VLibras"),
        );
    };
});

function openToolbar() {
    fireEvent.click(screen.getByRole("button", { name: "Mostrar barra de acessibilidade" }));
}

beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.highContrast;
    document.documentElement.style.removeProperty("--accessibility-font-scale");
    delete window.VLibras;
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("keeps the toolbar toggle in the corner and opens with an accessible label", () => {
    const { container } = render(<AccessibilityTools />);
    const showButton = screen.getByRole("button", { name: "Mostrar barra de acessibilidade" });

    expect(showButton).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector('[role="toolbar"]')).not.toBeVisible();
    expect(container.querySelector("[data-accessibility-tools]")).toHaveStyle({ position: "fixed", left: "58px" });
    expect(screen.queryByRole("button", { name: "Ler conteúdo em voz alta" })).not.toBeInTheDocument();
    expect(screen.queryByText("Ouvir conteúdo")).not.toBeInTheDocument();

    openToolbar();
    expect(screen.getByRole("toolbar", { name: "Barra de acessibilidade" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar barra de acessibilidade" }));
    expect(screen.getByRole("button", { name: "Mostrar barra de acessibilidade" })).toHaveAttribute("aria-expanded", "false");
});

test("increments and decrements font through all levels, resets, and respects bounds", async () => {
    render(<AccessibilityTools />);
    openToolbar();
    const decrease = screen.getByRole("button", { name: "Diminuir tamanho da fonte" });
    const reset = screen.getByRole("button", { name: "Restaurar tamanho da fonte" });
    const increase = screen.getByRole("button", { name: "Aumentar tamanho da fonte" });

    expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("1");
    for (const scale of ["1.1", "1.2"]) {
        fireEvent.click(increase);
        await waitFor(() => expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe(scale));
    }
    expect(increase).toBeDisabled();
    fireEvent.click(increase);
    expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("1.2");

    for (const scale of ["1.1", "1", "0.9", "0.8"]) {
        fireEvent.click(decrease);
        await waitFor(() => expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe(scale));
    }
    expect(decrease).toBeDisabled();
    fireEvent.click(decrease);
    expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("0.8");

    fireEvent.click(reset);
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("1"));
    expect(reset).toBeDisabled();
});

test("toggles contrast, keeps the control visible, persists it, and restores it", async () => {
    const { unmount } = render(<AccessibilityTools />);
    openToolbar();
    const contrast = screen.getByRole("button", { name: "Alto contraste" });

    fireEvent.click(contrast);
    await waitFor(() => expect(contrast).toHaveAttribute("aria-pressed", "true"));
    expect(contrast).toBeVisible();
    expect(contrast).toHaveTextContent("Alto contraste");
    expect(document.documentElement).toHaveAttribute("data-high-contrast", "true");
    expect(window.localStorage.getItem("restaurante-popular:alto-contraste")).toBe("true");

    unmount();
    render(<AccessibilityTools />);
    openToolbar();
    const restored = screen.getByRole("button", { name: "Alto contraste" });
    await waitFor(() => expect(restored).toHaveAttribute("aria-pressed", "true"));
    expect(restored).toBeVisible();

    fireEvent.click(restored);
    expect(restored).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem("restaurante-popular:alto-contraste")).toBe("false");
    expect(document.documentElement).not.toHaveAttribute("data-high-contrast");
});

test("keeps contrast usable when browser storage is blocked", () => {
    render(<AccessibilityTools />);
    openToolbar();
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage blocked");
    });

    const contrast = screen.getByRole("button", { name: "Alto contraste" });
    fireEvent.click(contrast);
    expect(contrast).toHaveAttribute("aria-pressed", "true");
    expect(contrast).toBeVisible();
    expect(document.documentElement).toHaveAttribute("data-high-contrast", "true");
});

test("loads VLibras and keeps the low-vision toggle usable when its script fails", () => {
    window.VLibras = { Widget: jest.fn() };
    render(<AccessibilityTools />);
    openToolbar();
    expect(screen.getByTestId("vlibras-script")).toHaveAttribute("data-src", "https://vlibras.gov.br/app/vlibras-plugin.js");
    expect(screen.getByTestId("vlibras-script")).toHaveAttribute("data-strategy", "lazyOnload");

    fireEvent.click(screen.getByRole("button", { name: "Simular carregamento VLibras" }));
    expect(window.VLibras.Widget).toHaveBeenCalledWith({ rootPath: "https://vlibras.gov.br/app", position: "L" });
    expect(screen.getByText("O widget VLibras foi carregado.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simular falha VLibras" }));
    expect(screen.getByText("O widget VLibras está indisponível no momento.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ocultar barra de acessibilidade" })).toBeEnabled();
});
