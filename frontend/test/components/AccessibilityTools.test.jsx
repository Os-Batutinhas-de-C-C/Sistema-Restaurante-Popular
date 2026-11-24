import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccessibilityTools from "@/components/AccessibilityTools/AccessibilityTools";

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
}));

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

const { usePathname } = jest.requireMock("next/navigation");

function installSpeechApi() {
    const speech = {
        cancel: jest.fn(),
        getVoices: jest.fn(() => [{ lang: "pt-BR", name: "Português do Brasil" }]),
        speak: jest.fn(),
    };
    const utterances = [];
    const OriginalUtterance = window.SpeechSynthesisUtterance;
    const originalSpeechDescriptor = Object.getOwnPropertyDescriptor(window, "speechSynthesis");

    window.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => {
        const utterance = {};
        utterances.push(utterance);
        return utterance;
    });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: speech });

    return {
        speech,
        utterances,
        restore() {
            if (OriginalUtterance === undefined) delete window.SpeechSynthesisUtterance;
            else window.SpeechSynthesisUtterance = OriginalUtterance;
            if (originalSpeechDescriptor) Object.defineProperty(window, "speechSynthesis", originalSpeechDescriptor);
            else delete window.speechSynthesis;
        },
    };
}

beforeEach(() => {
    usePathname.mockReturnValue("/");
    window.localStorage.clear();
    delete document.documentElement.dataset.highContrast;
    document.documentElement.style.removeProperty("--accessibility-font-scale");
    document.documentElement.style.removeProperty("font-size");
    delete window.VLibras;
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("renders the shared toolbar with font controls aligned to its responsive container", () => {
    const { container } = render(<AccessibilityTools />);
    expect(screen.getByRole("toolbar", { name: "Barra de acessibilidade" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diminuir tamanho da fonte" })).toBeInTheDocument();
    expect(container.querySelector("[class*=toolbarContainer]")).toBeInTheDocument();
});

test("can hide and show the low-vision controls with an accessible arrow", () => {
    render(<AccessibilityTools />);
    const toolbar = screen.getByRole("toolbar", { name: "Barra de acessibilidade" });
    const hideButton = screen.getByRole("button", { name: "Ocultar barra de acessibilidade" });

    expect(hideButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(hideButton);
    expect(toolbar).not.toBeVisible();

    const showButton = screen.getByRole("button", { name: "Mostrar barra de acessibilidade" });
    expect(showButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(showButton);
    expect(screen.getByRole("toolbar", { name: "Barra de acessibilidade" })).toBeVisible();
});

test("changes font size in bounded levels and exposes the selected level", async () => {
    render(<AccessibilityTools />);
    const decrease = screen.getByRole("button", { name: "Diminuir tamanho da fonte" });
    const reset = screen.getByRole("button", { name: "Restaurar tamanho da fonte" });
    const increase = screen.getByRole("button", { name: "Aumentar tamanho da fonte" });

    fireEvent.click(decrease);
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("0.9"));
    expect(decrease).toHaveAttribute("aria-pressed", "true");
    expect(decrease).toBeDisabled();
    fireEvent.click(increase);
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("1.1"));
    expect(increase).toHaveAttribute("aria-pressed", "true");
    expect(increase).toBeDisabled();
    fireEvent.click(reset);
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--accessibility-font-scale")).toBe("1"));
});

test("restores high contrast from storage and persists changes", async () => {
    window.localStorage.setItem("restaurante-popular:alto-contraste", "true");
    render(<AccessibilityTools />);
    const contrast = screen.getByRole("button", { name: "Alto contraste" });

    await waitFor(() => expect(contrast).toHaveAttribute("aria-pressed", "true"));
    expect(document.documentElement).toHaveAttribute("data-high-contrast", "true");
    fireEvent.click(contrast);
    expect(contrast).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem("restaurante-popular:alto-contraste")).toBe("false");
    expect(document.documentElement).not.toHaveAttribute("data-high-contrast");
});

test("keeps high contrast available when local storage writes are blocked", () => {
    render(<AccessibilityTools />);
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage blocked");
    });

    const contrast = screen.getByRole("button", { name: "Alto contraste" });
    fireEvent.click(contrast);
    expect(contrast).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveAttribute("data-high-contrast", "true");
});

test("reads the main content in Brazilian Portuguese and allows stopping", async () => {
    const api = installSpeechApi();
    const { container } = render(<AccessibilityTools />);
    const main = document.createElement("main");
    Object.defineProperty(main, "innerText", { configurable: true, value: "Cardápio do dia: arroz e feijão." });
    container.appendChild(main);

    await waitFor(() => expect(screen.getByRole("button", { name: "Ler conteúdo em voz alta" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Ler conteúdo em voz alta" }));
    expect(api.speech.speak).toHaveBeenCalledTimes(1);
    expect(api.utterances[0].lang).toBe("pt-BR");
    expect(api.utterances[0].voice.lang).toBe("pt-BR");
    expect(screen.getByRole("button", { name: "Interromper leitura em voz alta" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Interromper leitura em voz alta" }));
    expect(api.speech.cancel).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Ler conteúdo em voz alta" })).toHaveAttribute("aria-pressed", "false");
    api.restore();
});

test("cancels speech when the route changes", async () => {
    const api = installSpeechApi();
    const { rerender, container } = render(<AccessibilityTools />);
    const main = document.createElement("main");
    Object.defineProperty(main, "innerText", { configurable: true, value: "Conteúdo principal." });
    container.appendChild(main);
    await waitFor(() => expect(screen.getByRole("button", { name: "Ler conteúdo em voz alta" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Ler conteúdo em voz alta" }));

    usePathname.mockReturnValue("/cardapio");
    rerender(<AccessibilityTools />);
    expect(api.speech.cancel).toHaveBeenCalled();
    api.restore();
});

test("reports unsupported speech and preserves other controls", async () => {
    render(<AccessibilityTools />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Ler conteúdo em voz alta" })).toBeDisabled());
    expect(screen.getByText("A leitura em voz alta não está disponível neste navegador.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alto contraste" })).toBeEnabled();
});

test("initializes VLibras on the left and reports script failures without hiding controls", () => {
    window.VLibras = { Widget: jest.fn() };
    render(<AccessibilityTools />);
    expect(screen.getByTestId("vlibras-script")).toHaveAttribute("data-src", "https://vlibras.gov.br/app/vlibras-plugin.js");
    expect(screen.getByTestId("vlibras-script")).toHaveAttribute("data-strategy", "lazyOnload");

    fireEvent.click(screen.getByRole("button", { name: "Simular carregamento VLibras" }));
    expect(window.VLibras.Widget).toHaveBeenCalledWith({ rootPath: "https://vlibras.gov.br/app", position: "L" });
    expect(screen.getByText("O widget VLibras foi carregado.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simular falha VLibras" }));
    expect(screen.getByText("O widget VLibras está indisponível no momento.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alto contraste" })).toBeEnabled();
});
