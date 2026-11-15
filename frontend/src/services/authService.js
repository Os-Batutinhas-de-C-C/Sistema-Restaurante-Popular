"use client";

import { useState } from "react";
import { apiRequest, ApiError } from "./apiClient";
import { clearAuthSession, getAuthSession, setAuthSession } from "./authSession";

export async function autenticar(email, senha) {
    const { data } = await apiRequest("/auth/login", {
        method: "POST",
        body: { email: email.trim(), senha },
    });
    if (
        !data || typeof data.accessToken !== "string" || !data.accessToken ||
        data.tokenType?.toLowerCase() !== "bearer" || !Number.isFinite(data.expiresIn) ||
        !data.usuario || typeof data.usuario.perfil !== "string"
    ) {
        throw new ApiError("O servidor retornou uma sessão inválida.", { code: "INVALID_RESPONSE" });
    }
    return setAuthSession(data);
}

export function obterSessao() {
    return getAuthSession();
}

export function encerrarSessao() {
    clearAuthSession();
}

export function useAuthService(router) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [recoveryOpen, setRecoveryOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function submit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const session = await autenticar(email, password);
            if (session.usuario.perfil === "Caixa") router.push("/painel-caixa");
            else if (["Nutricionista", "Gestor"].includes(session.usuario.perfil)) router.push("/painel-nutricionista");
            else router.push("/mainPage");
        } catch (cause) {
            setError(cause?.message || "Não foi possível entrar. Confira o e-mail e a senha.");
        } finally {
            setSubmitting(false);
        }
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
        email, setEmail, password, setPassword, showPassword, submitting, error,
        togglePassword: () => setShowPassword((visible) => !visible),
        submit, recoveryOpen, openRecovery, closeRecovery, recoveryEmail,
        setRecoveryEmail, submitRecovery, snackbarOpen, setSnackbarOpen,
    };
}
