"use client";

import { useState } from "react";

export const AUTH_STORAGE_KEY = "usuarioRestaurantePopular";

export function validateCredentials(username, password) {
    if (!username.trim() || !password.trim()) {
        return "Informe seu usuário e sua senha.";
    }
    return "";
}

export function resolveProfile(username) {
    const normalized = username.trim().toLowerCase();
    return normalized.includes("nutri") ? "Nutricionista" : "Gestor";
}

export function authenticate(username, password) {
    const error = validateCredentials(username, password);
    if (error) return { error };

    const perfil = resolveProfile(username);
    const user = { perfil, nome: perfil };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { user, destination: "/painel-nutricionista-noticias" };
}

export async function requestPasswordRecovery(email) {
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return { error: "Informe um e-mail válido." };
    }

    // Solicitação simulada até a integração com o serviço de e-mail.
    return { message: "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação." };
}

export function useAuthService(router) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [recoveryOpen, setRecoveryOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoveryMessage, setRecoveryMessage] = useState("");
    const [recoveryError, setRecoveryError] = useState("");

    function submit(event) {
        event.preventDefault();
        const result = authenticate(username, password);
        if (result.error) {
            setError(result.error);
            return;
        }
        setError("");
        router.push(result.destination);
    }

    async function submitRecovery(event) {
        event.preventDefault();
        const result = await requestPasswordRecovery(recoveryEmail);
        setRecoveryError(result.error || "");
        setRecoveryMessage(result.message || "");
    }

    return {
        username, setUsername, password, setPassword, showPassword,
        togglePassword: () => setShowPassword((visible) => !visible),
        error, submit,
        recoveryOpen, openRecovery: () => {
            setRecoveryMessage(""); setRecoveryError(""); setRecoveryOpen(true);
        },
        closeRecovery: () => setRecoveryOpen(false),
        recoveryEmail, setRecoveryEmail, recoveryMessage, recoveryError,
        submitRecovery,
    };
}
