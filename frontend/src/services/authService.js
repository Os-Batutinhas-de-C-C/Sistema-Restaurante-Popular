"use client";

import { useState } from "react";

export const AUTH_STORAGE_KEY = "usuarioRestaurantePopular";

export function autenticar(usuario, senha) {
    if (usuario !== "admin" || senha !== "admin") return null;

    const sessao = { usuario: "admin", perfil: "Nutricionista", nome: "Nutricionista" };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessao));
    return sessao;
}

export function obterSessao() {
    try {
        const valorSalvo = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!valorSalvo) return null;

        const sessao = JSON.parse(valorSalvo);
        if (sessao?.usuario === "admin" && sessao?.perfil === "Nutricionista") {
            return sessao;
        }

        // Remove sessões criadas por versões antigas do mock ou dados inválidos.
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function encerrarSessao() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function useAuthService(router) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [recoveryOpen, setRecoveryOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    function submit(event) {
        event.preventDefault();
        if (autenticar(username, password)) router.push("/painel-nutricionista");
    }

    function openRecovery() {
        setRecoveryEmail("");
        setRecoveryOpen(true);
    }

    function closeRecovery() {
        setRecoveryOpen(false);
        setRecoveryEmail("");
    }

    function submitRecovery(event) {
        event.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail.trim())) return;
        closeRecovery();
        setSnackbarOpen(true);
    }

    return {
        username, setUsername, password, setPassword, showPassword,
        togglePassword: () => setShowPassword((visible) => !visible),
        submit, recoveryOpen, openRecovery, closeRecovery, recoveryEmail,
        setRecoveryEmail, submitRecovery, snackbarOpen, setSnackbarOpen,
    };
}
