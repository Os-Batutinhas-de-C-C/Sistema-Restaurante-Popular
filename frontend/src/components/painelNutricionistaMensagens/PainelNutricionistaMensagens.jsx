"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SeletorIntervaloDatas from "../SeletorIntervaloDatas/SeletorIntervaloDatas";
import { listarMensagensPorPeriodo, obterPeriodoPadrao, removerMensagem } from "../../services/mensagensService";

const MENSAGEM_VAZIA = "Nenhuma mensagem no período selecionado.";

function formatarData(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatarDataHora(data, hora) {
    const [ano, mes, dia] = data.split("-").map(Number);
    const [horas, minutos] = hora.split(":").map(Number);
    const parsed = new Date(ano, mes - 1, dia, horas, minutos);
    return `${formatarData(parsed)} | ${hora}`;
}

function resumirTexto(texto, maxLength = 100) {
    if (!texto) return "";
    return texto.length > maxLength ? `${texto.slice(0, maxLength).trim()}...` : texto;
}

function exibirNomeRemetente(mensagem) {
    return mensagem?.nome && mensagem.nome.trim() ? mensagem.nome.trim() : "Não informado";
}

export default function PainelNutricionistaMensagens() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [periodo, setPeriodo] = useState(() => obterPeriodoPadrao());
    const [mensagens, setMensagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [previewMessage, setPreviewMessage] = useState(null);
    const [confirmDeleteMessage, setConfirmDeleteMessage] = useState(null);

    const carregarMensagens = () => {
        setLoading(true);
        setError("");

        try {
            const lista = listarMensagensPorPeriodo(periodo);
            setMensagens(lista);
        } catch {
            setError("Não foi possível carregar as mensagens.");
            setMensagens([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const usuario = JSON.parse(localStorage.getItem("usuarioRestaurantePopular") || "null");

        if (!usuario || !["Nutricionista", "Gestor"].includes(usuario.perfil)) {
            router.replace("/login");
            return;
        }

        carregarMensagens();
    }, [router]);

    useEffect(() => {
        carregarMensagens();
    }, [periodo.from, periodo.to]);

    const handleRemover = () => {
        if (!confirmDeleteMessage) return;

        removerMensagem(confirmDeleteMessage.id);
        const atualizadas = listarMensagensPorPeriodo(periodo);
        setMensagens(atualizadas);
        setConfirmDeleteMessage(null);
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
        },
    };

    const content = loading ? (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            Carregando mensagens...
        </Box>
    ) : error ? (
        <Box sx={{ p: 3, textAlign: "center", color: "error.main" }}>{error}</Box>
    ) : mensagens.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>{MENSAGEM_VAZIA}</Box>
    ) : isMobile ? (
        <Stack spacing={1.5}>
            {mensagens.map((mensagem) => (
                <Paper
                    key={mensagem.id}
                    variant="outlined"
                    sx={{ borderRadius: 2, borderColor: "#e5eaed", p: 1.75 }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                {formatarDataHora(mensagem.data, mensagem.hora)}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                                {mensagem.titulo}
                            </Typography>
                        </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                        {resumirTexto(mensagem.texto)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <IconButton
                            size="small"
                            aria-label={`Visualizar mensagem ${mensagem.titulo}`}
                            onClick={() => setPreviewMessage(mensagem)}
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: "#0789cf",
                                color: "common.white",
                                boxShadow: "0 3px 7px rgba(0, 0, 0, 0.22)",
                                "&:hover": { bgcolor: "#0578b8" },
                            }}
                        >
                            <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            aria-label={`Apagar mensagem ${mensagem.titulo}`}
                            onClick={() => setConfirmDeleteMessage(mensagem)}
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: "#0789cf",
                                color: "common.white",
                                boxShadow: "0 3px 7px rgba(0, 0, 0, 0.22)",
                                "&:hover": { bgcolor: "#0578b8" },
                            }}
                        >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Paper>
            ))}
        </Stack>
    ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#e5eaed", borderRadius: 2 }}>
            <Table size="small" aria-label="Mensagens">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 150, fontWeight: 700 }}>Data</TableCell>
                        <TableCell sx={{ width: 220, fontWeight: 700 }}>Título</TableCell>
                        <TableCell sx={{ width: 240, fontWeight: 700 }}>Descrição</TableCell>
                        <TableCell sx={{ width: 90 }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {mensagens.map((mensagem) => (
                        <TableRow key={mensagem.id} hover>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {formatarDataHora(mensagem.data, mensagem.hora)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {mensagem.titulo}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {resumirTexto(mensagem.texto)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <IconButton
                                        aria-label={`Visualizar mensagem ${mensagem.titulo}`}
                                        onClick={() => setPreviewMessage(mensagem)}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: "#0789cf",
                                            color: "common.white",
                                            boxShadow: "0 3px 7px rgba(0, 0, 0, 0.22)",
                                            "&:hover": { bgcolor: "#0578b8" },
                                        }}
                                    >
                                        <VisibilityOutlinedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        aria-label={`Apagar mensagem ${mensagem.titulo}`}
                                        onClick={() => setConfirmDeleteMessage(mensagem)}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: "#0789cf",
                                            color: "common.white",
                                            boxShadow: "0 3px 7px rgba(0, 0, 0, 0.22)",
                                            "&:hover": { bgcolor: "#0578b8" },
                                        }}
                                    >
                                        <DeleteOutlineOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box component="main" sx={{ width: "100%", maxWidth: 616, mx: "auto", px: { xs: 2, sm: 0 }, pt: 4, pb: 6 }}>
            <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: 24, sm: 28 } }}>
                Mensagens
            </Typography>

            <Paper
                component="section"
                variant="outlined"
                aria-label="Filtro de período"
                sx={{
                    minHeight: 94,
                    borderColor: "#e4e8eb",
                    borderRadius: 2,
                    px: 3,
                    py: 3,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                }}
            >
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <SeletorIntervaloDatas
                        value={periodo}
                        onChange={(value) => setPeriodo(value || obterPeriodoPadrao())}
                        label="Selecione o Período"
                        ariaLabel="Abrir seletor de período"
                    />
                </Box>
            </Paper>

            {content}

            <Dialog
                open={Boolean(previewMessage)}
                onClose={() => setPreviewMessage(null)}
                fullWidth
                maxWidth="sm"
                aria-labelledby="dialog-visualizar-mensagem"
            >
                <DialogTitle id="dialog-visualizar-mensagem">Visualizar Mensagem</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.5}>
                        <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
                            <Box component="span" sx={{ borderLeft: "1px solid #d0d7de", pl: 1, display: "inline-block" }}>
                                {previewMessage ? formatarDataHora(previewMessage.data, previewMessage.hora) : ""}
                            </Box>
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {previewMessage?.titulo}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Remetente: {previewMessage ? exibirNomeRemetente(previewMessage) : "Não informado"}
                        </Typography>
                        <Box sx={{ backgroundColor: "#f6f8fa", border: "1px solid #e5eaed", borderRadius: 2, p: 1.5 }}>
                            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                                {previewMessage?.texto}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button variant="contained" onClick={() => setPreviewMessage(null)} sx={{ bgcolor: "#008fd3" }}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(confirmDeleteMessage)}
                onClose={() => setConfirmDeleteMessage(null)}
                aria-labelledby="dialog-remover-mensagem"
            >
                <DialogTitle id="dialog-remover-mensagem">Apagar mensagem</DialogTitle>
                <DialogContent>
                    <Typography>
                        Deseja apagar a mensagem <strong>{confirmDeleteMessage?.titulo}</strong>? Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteMessage(null)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={handleRemover}>
                        Apagar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
