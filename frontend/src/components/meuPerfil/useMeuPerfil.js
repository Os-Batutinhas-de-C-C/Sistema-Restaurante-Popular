"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAuthSession, updateAuthSessionUser } from "@/services/authSession";
import { alterarMinhaSenha, obterMeuPerfil, perfilParaSessao, salvarMeuPerfil } from "@/services/perfilService";

const PASSWORD_VALUES = { "current-password": "", "new-password": "", "confirm-password": "" };

function valoresDaConta(perfil) {
    return { "full-name": perfil.nome, "recovery-email": perfil.emailRecuperacao };
}

export default function useMeuPerfil() {
    const router = useRouter();
    const [usuarioInicial] = useState(() => getAuthSession()?.usuario);
    const [perfil, setPerfil] = useState(null);
    const [accountValues, setAccountValues] = useState(() => ({
        "full-name": usuarioInicial?.nome ?? "",
        "recovery-email": usuarioInicial?.email ?? "",
    }));
    const [passwordValues, setPasswordValues] = useState(PASSWORD_VALUES);
    const [accountPassword, setAccountPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [accountErrors, setAccountErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [accountError, setAccountError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [savingAccount, setSavingAccount] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [success, setSuccess] = useState("");

    const requireLogin = useCallback((reason = "sessao-expirada") => {
        clearAuthSession();
        router.replace(`/login?motivo=${reason}`);
    }, [router]);

    useEffect(() => {
        let active = true;
        obterMeuPerfil()
            .then((loaded) => {
                if (!active) return;
                if (!updateAuthSessionUser(perfilParaSessao(loaded))) {
                    requireLogin();
                    return;
                }
                setPerfil(loaded);
                setAccountValues(valoresDaConta(loaded));
                setLoadError("");
            })
            .catch((error) => {
                if (!active) return;
                if (error.status === 401) requireLogin();
                else setLoadError(error.message || "Não foi possível carregar o perfil.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [reloadKey, requireLogin]);

    const retry = () => {
        setLoading(true);
        setLoadError("");
        setReloadKey((current) => current + 1);
    };

    const handleAccountChange = (event) => {
        const { name, value } = event.target;
        setAccountValues((current) => ({ ...current, [name]: value }));
        setAccountErrors((current) => ({ ...current, [name]: undefined }));
        setAccountError("");
        if (name === "recovery-email" && value.trim() === perfil?.emailRecuperacao) {
            setAccountPassword("");
        }
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordValues((current) => ({ ...current, [name]: value }));
        setPasswordErrors((current) => ({ ...current, [name]: undefined }));
        setPasswordError("");
    };

    const emailChanged = Boolean(perfil && accountValues["recovery-email"].trim() !== perfil.emailRecuperacao);
    const busy = savingAccount || savingPassword;

    const saveAccount = async (event) => {
        event.preventDefault();
        if (!perfil || busy) return;
        const nome = accountValues["full-name"].trim();
        const email = accountValues["recovery-email"].trim();
        const errors = {};
        if (!nome) errors["full-name"] = "Informe seu nome.";
        else if (Array.from(nome).length > 255) errors["full-name"] = "Use até 255 caracteres.";
        if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) errors["recovery-email"] = "Informe um e-mail válido.";
        else if (Array.from(email).length > 255) errors["recovery-email"] = "Use até 255 caracteres.";
        if (emailChanged && !accountPassword) errors["account-password"] = "Informe a senha atual para alterar o e-mail.";
        setAccountErrors(errors);
        setAccountError("");
        if (Object.keys(errors).length) return;

        setSavingAccount(true);
        try {
            const result = await salvarMeuPerfil({ nome, emailRecuperacao: email, senhaAtual: emailChanged ? accountPassword : undefined });
            if (result.requerNovoLogin) {
                requireLogin("perfil-alterado");
                return;
            }
            if (!updateAuthSessionUser(perfilParaSessao(result.usuario))) {
                requireLogin();
                return;
            }
            setPerfil(result.usuario);
            setAccountValues(valoresDaConta(result.usuario));
            setAccountPassword("");
            setSuccess("Informações da conta salvas com sucesso.");
        } catch (error) {
            if (error.status === 401) requireLogin();
            else if (error.code === "CURRENT_PASSWORD_INVALID") {
                setAccountErrors({ "account-password": "A senha atual não confere." });
            } else if (error.code === "EMAIL_IN_USE") {
                setAccountErrors({ "recovery-email": "Este e-mail já está em uso." });
            } else setAccountError(error.message || "Não foi possível salvar suas informações.");
        } finally {
            setSavingAccount(false);
        }
    };

    const savePassword = async (event) => {
        event.preventDefault();
        if (!perfil || busy) return;
        const current = passwordValues["current-password"];
        const next = passwordValues["new-password"];
        const confirmation = passwordValues["confirm-password"];
        const errors = {};
        if (!current) errors["current-password"] = "Informe a senha atual.";
        if (!next.trim() || Array.from(next).length < 6) errors["new-password"] = "Use pelo menos 6 caracteres.";
        else if (new TextEncoder().encode(next).length > 72) errors["new-password"] = "A nova senha é longa demais. Reduza o tamanho.";
        if (!confirmation) errors["confirm-password"] = "Confirme a nova senha.";
        else if (confirmation !== next) errors["confirm-password"] = "A confirmação deve ser igual à nova senha.";
        setPasswordErrors(errors);
        setPasswordError("");
        if (Object.keys(errors).length) return;

        setSavingPassword(true);
        try {
            await alterarMinhaSenha({ senhaAtual: current, novaSenha: next, confirmacaoSenha: confirmation });
            setPasswordValues(PASSWORD_VALUES);
            requireLogin("perfil-alterado");
        } catch (error) {
            if (error.status === 401) requireLogin();
            else if (error.code === "CURRENT_PASSWORD_INVALID") {
                setPasswordErrors({ "current-password": "A senha atual não confere." });
            } else setPasswordError(error.message || "Não foi possível alterar sua senha.");
        } finally {
            setSavingPassword(false);
        }
    };

    return {
        perfil, usuarioInicial, accountValues, passwordValues, accountPassword,
        loading, loadError, retry, accountErrors, passwordErrors, accountError, passwordError,
        savingAccount, savingPassword, busy, emailChanged, success, setSuccess,
        handleAccountChange, handlePasswordChange, saveAccount, savePassword,
        changeAccountPassword: (value) => {
            setAccountPassword(value);
            setAccountErrors((current) => ({ ...current, "account-password": undefined }));
            setAccountError("");
        },
    };
}
