"use client";

import { Alert } from "@mui/material";
import { useSearchParams } from "next/navigation";

const NOTICES = {
    "perfil-alterado": "Seus dados de acesso foram atualizados. Entre novamente para continuar.",
    "sessao-expirada": "Sua sessão terminou. Entre novamente para continuar.",
};

export default function LoginNotice() {
    const reason = useSearchParams().get("motivo");
    const message = NOTICES[reason];
    if (!message) return null;
    return <Alert severity={reason === "perfil-alterado" ? "success" : "info"}>{message}</Alert>;
}
