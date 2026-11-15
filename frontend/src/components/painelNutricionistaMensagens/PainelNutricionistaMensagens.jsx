"use client";

import { Alert, Box, Snackbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import FiltroPeriodoPainel from "../painelCompartilhado/FiltroPeriodoPainel";
import ListaMensagens from "./ListaMensagens/ListaMensagens";
import ModalVisualizarMensagem from "./ModalVisualizarMensagem/ModalVisualizarMensagem";
import ModalRemoverMensagem from "./ModalRemoverMensagem/ModalRemoverMensagem";
import { listarMensagensPorPeriodo, obterPeriodoPadrao, removerMensagem } from "../../services/mensagensService";
import { obterSessao } from "../../services/authService";

export default function PainelNutricionistaMensagens() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [periodo, setPeriodo] = useState(obterPeriodoPadrao);
    const [mensagens, setMensagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acessoVerificado, setAcessoVerificado] = useState(false);
    const [mensagemVisualizada, setMensagemVisualizada] = useState(null);
    const [mensagemParaRemover, setMensagemParaRemover] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const loadSequence = useRef(0);

    useEffect(() => {
        const usuario = obterSessao()?.usuario;
        const autorizado = Boolean(usuario && ["Nutricionista", "Gestor", "Caixa"].includes(usuario.perfil));

        if (!autorizado) {
            router.replace("/login");
            return;
        }

        const timeout = window.setTimeout(() => setAcessoVerificado(true), 0);
        return () => window.clearTimeout(timeout);
    }, [router]);

    const carregarMensagens = useCallback(async () => {
        const sequence = ++loadSequence.current;
        try {
            const resultado = await listarMensagensPorPeriodo(periodo);
            if (sequence === loadSequence.current) setMensagens(resultado);
        } catch (erro) {
            if (sequence === loadSequence.current) setError(erro?.message || "Não foi possível carregar as mensagens.");
        } finally {
            if (sequence === loadSequence.current) setLoading(false);
        }
    }, [periodo]);

    const recarregarMensagens = () => {
        setLoading(true);
        setError("");
        return carregarMensagens();
    };

    const confirmarExclusao = async () => {
        if (!mensagemParaRemover) return;
        try {
            await removerMensagem(mensagemParaRemover.id);
            setMensagemParaRemover(null);
            setSnackbar({ open: true, message: "Mensagem removida com sucesso.", severity: "success" });
            await recarregarMensagens();
        } catch (erro) {
            setSnackbar({ open: true, message: erro?.message || "Não foi possível remover a mensagem.", severity: "error" });
        }
    };

    useEffect(() => {
        if (!acessoVerificado) return undefined;
        const sequence = ++loadSequence.current;
        let ativo = true;
        listarMensagensPorPeriodo(periodo)
            .then((resultado) => {
                if (ativo && sequence === loadSequence.current) {
                    setMensagens(resultado);
                    setError("");
                }
            })
            .catch((erro) => {
                if (ativo && sequence === loadSequence.current) setError(erro?.message || "Não foi possível carregar as mensagens.");
            })
            .finally(() => {
                if (ativo && sequence === loadSequence.current) setLoading(false);
            });
        return () => {
            ativo = false;
            loadSequence.current += 1;
        };
    }, [acessoVerificado, periodo]);

    return (
        <>
            <NavbarPainel />
            <Box
                component="main"
                sx={{
                    width: "100%",
                    maxWidth: 1180,
                    mx: "auto",
                    px: { xs: 2, sm: 3 },
                    pt: { xs: "76px", sm: "84px" },
                    pb: 6,
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                    Mensagens
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                    <FiltroPeriodoPainel
                        value={periodo}
                        onChange={(value) => {
                            setLoading(true);
                            setError("");
                            setPeriodo(value || obterPeriodoPadrao());
                        }}
                        label="Filtro de período"
                    />
                    <ListaMensagens
                        mensagens={mensagens}
                        loading={loading || !acessoVerificado}
                        error={error}
                        onRetry={recarregarMensagens}
                        onVisualizar={setMensagemVisualizada}
                        onExcluir={setMensagemParaRemover}
                        isMobile={isMobile}
                    />
                </Box>
            </Box>

            <ModalVisualizarMensagem
                mensagem={mensagemVisualizada}
                onClose={() => setMensagemVisualizada(null)}
            />
            <ModalRemoverMensagem
                mensagem={mensagemParaRemover}
                onClose={() => setMensagemParaRemover(null)}
                onConfirmar={confirmarExclusao}
            />
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((atual) => ({ ...atual, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((atual) => ({ ...atual, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
