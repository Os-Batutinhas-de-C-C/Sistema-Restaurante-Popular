"use client";

import AddIcon from "@mui/icons-material/Add";
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
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SeletorIntervaloDatas from "../SeletorIntervaloDatas/SeletorIntervaloDatas";
import {
    listarNoticiasPorPeriodo,
    obterPeriodoPadrao,
    publicarNoticia,
    removerNoticia,
} from "../../services/noticiasService";

const MENSAGEM_VAZIA = "Nenhuma notícia no período selecionado.";

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

export default function PainelNutricionistaNoticias() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [periodo, setPeriodo] = useState(() => obterPeriodoPadrao());
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [previewNotice, setPreviewNotice] = useState(null);
    const [confirmDeleteNotice, setConfirmDeleteNotice] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [form, setForm] = useState({ titulo: "", texto: "", duracaoHoras: "12" });
    const [formErrors, setFormErrors] = useState({});

    const carregarNoticias = () => {
        setLoading(true);
        setError("");

        try {
            const lista = listarNoticiasPorPeriodo(periodo);
            setNoticias(lista);
        } catch {
            setError("Não foi possível carregar as notícias.");
            setNoticias([]);
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

        carregarNoticias();
    }, [router]);

    useEffect(() => {
        carregarNoticias();
    }, [periodo.from, periodo.to]);

    const mostrarSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const validarFormulario = () => {
        const proximoErro = {};
        const duracao = Number(form.duracaoHoras);

        if (!form.titulo.trim()) {
            proximoErro.titulo = "Título do aviso é obrigatório.";
        }

        if (!form.texto.trim()) {
            proximoErro.texto = "Texto do aviso é obrigatório.";
        }

        if (!Number.isInteger(duracao) || duracao < 1 || duracao > 72) {
            proximoErro.duracaoHoras = "Duração deve ser um número inteiro entre 1 e 72 horas.";
        }

        setFormErrors(proximoErro);
        return Object.keys(proximoErro).length === 0;
    };

    const handlePublicar = () => {
        if (!validarFormulario()) return;

        const novaNoticia = publicarNoticia({
            titulo: form.titulo,
            texto: form.texto,
            duracaoHoras: Number(form.duracaoHoras),
            data: new Date(),
            hora: new Date(),
        });

        const atualizadas = listarNoticiasPorPeriodo(periodo);
        setNoticias(atualizadas);
        setPublishDialogOpen(false);
        setForm({ titulo: "", texto: "", duracaoHoras: "12" });
        setFormErrors({});
        mostrarSnackbar(`Notícia publicada: ${novaNoticia.titulo}`);
    };

    const handleRemover = () => {
        if (!confirmDeleteNotice) return;

        removerNoticia(confirmDeleteNotice.id);
        const atualizadas = listarNoticiasPorPeriodo(periodo);
        setNoticias(atualizadas);
        setConfirmDeleteNotice(null);
        mostrarSnackbar(`Notícia removida: ${confirmDeleteNotice.titulo}`);
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
        },
        "& .MuiFormHelperText-root": {
            marginLeft: 0,
        },
    };

    const content = loading ? (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            Carregando notícias...
        </Box>
    ) : error ? (
        <Box sx={{ p: 3, textAlign: "center", color: "error.main" }}>{error}</Box>
    ) : noticias.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>{MENSAGEM_VAZIA}</Box>
    ) : isMobile ? (
        <Stack spacing={1.5}>
            {noticias.map((noticia) => (
                <Paper
                    key={noticia.id}
                    variant="outlined"
                    sx={{ borderRadius: 2, borderColor: "#e5eaed", p: 1.75 }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                {formatarDataHora(noticia.data, noticia.hora)}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                                {noticia.titulo}
                            </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                            {noticia.duracao ?? `${noticia.duracaoHoras ?? 0}h`}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                        {noticia.texto ?? noticia.descricao}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <IconButton
                            size="small"
                            aria-label={`Visualizar notícia ${noticia.titulo}`}
                            onClick={() => setPreviewNotice(noticia)}
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
                            aria-label={`Remover notícia ${noticia.titulo}`}
                            onClick={() => setConfirmDeleteNotice(noticia)}
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
            <Table size="small" aria-label="Lista de notícias e avisos">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 150, fontWeight: 700 }}>Data</TableCell>
                        <TableCell sx={{ width: 180, fontWeight: 700 }}>Título</TableCell>
                        <TableCell sx={{ width: 220, fontWeight: 700 }}>Descrição</TableCell>
                        <TableCell sx={{ width: 80, fontWeight: 700 }}>Duração</TableCell>
                        <TableCell sx={{ width: 90 }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {noticias.map((noticia) => (
                        <TableRow key={noticia.id} hover>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {formatarDataHora(noticia.data, noticia.hora)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {noticia.titulo}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {noticia.texto ?? noticia.descricao}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    {noticia.duracao ?? `${noticia.duracaoHoras ?? 0}h`}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <IconButton
                                        aria-label={`Visualizar notícia ${noticia.titulo}`}
                                        onClick={() => setPreviewNotice(noticia)}
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
                                        aria-label={`Remover notícia ${noticia.titulo}`}
                                        onClick={() => setConfirmDeleteNotice(noticia)}
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
                Notícias e Avisos
            </Typography>

            <Paper
                component="section"
                variant="outlined"
                aria-label="Filtros de notícias e avisos"
                sx={{
                    minHeight: 94,
                    borderColor: "#e5eaed",
                    borderRadius: "9px",
                    px: "24px",
                    py: 2,
                    mb: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                }}
            >
                <Box sx={{ display: "flex", width: "100%", maxWidth: 250 }}>
                    <SeletorIntervaloDatas
                        value={periodo}
                        onChange={(value) => setPeriodo(value || obterPeriodoPadrao())}
                        label="Selecione o Período"
                        ariaLabel="Abrir seletor de período"
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setPublishDialogOpen(true)}
                    sx={{
                        minWidth: 168,
                        height: 34,
                        borderRadius: "3px",
                        bgcolor: "#008fd3",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.23)",
                        fontSize: 11,
                        fontWeight: 700,
                        "&:hover": { bgcolor: "#007fbc" },
                    }}
                >
                    Publicar Notícia
                </Button>
            </Paper>

            {content}

            <Dialog
                open={publishDialogOpen}
                onClose={() => setPublishDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                aria-labelledby="dialog-publicar-noticia"
            >
                <DialogTitle id="dialog-publicar-noticia">Publicar Notícia</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Título do Aviso"
                            fullWidth
                            value={form.titulo}
                            onBlur={() => {
                                if (!form.titulo.trim()) {
                                    setFormErrors((atual) => ({ ...atual, titulo: "Título do aviso é obrigatório." }));
                                }
                            }}
                            onChange={(event) => {
                                setForm((atual) => ({ ...atual, titulo: event.target.value }));
                                setFormErrors((atual) => ({ ...atual, titulo: "" }));
                            }}
                            error={Boolean(formErrors.titulo)}
                            helperText={formErrors.titulo}
                            islotProps={{ htmlInput: { maxLength: 120 } }}
                            sx={inputSx}
                        />
                        <TextField
                            label="Texto do Aviso"
                            fullWidth
                            multiline
                            minRows={3}
                            value={form.texto}
                            onBlur={() => {
                                if (!form.texto.trim()) {
                                    setFormErrors((atual) => ({ ...atual, texto: "Texto do aviso é obrigatório." }));
                                }
                            }}
                            onChange={(event) => {
                                setForm((atual) => ({ ...atual, texto: event.target.value }));
                                setFormErrors((atual) => ({ ...atual, texto: "" }));
                            }}
                            error={Boolean(formErrors.texto)}
                            helperText={formErrors.texto || `${form.texto.length}/500`}
                            slotProps={{ htmlInput: { maxLength: 500 } }}
                            sx={inputSx}
                        />
                        <TextField
                            label="Duração (horas)"
                            type="number"
                            fullWidth
                            value={form.duracaoHoras}
                            onChange={(event) => {
                                setForm((atual) => ({ ...atual, duracaoHoras: event.target.value }));
                                setFormErrors((atual) => ({ ...atual, duracaoHoras: "" }));
                            }}
                            onBlur={() => {
                                const valor = Number(form.duracaoHoras);
                                if (!Number.isInteger(valor) || valor < 1 || valor > 72) {
                                    setFormErrors((atual) => ({ ...atual, duracaoHoras: "Duração deve ser um número inteiro entre 1 e 72 horas." }));
                                }
                            }}
                            error={Boolean(formErrors.duracaoHoras)}
                            helperText={formErrors.duracaoHoras}
                            slotProps={{ htmlInput: { min: 1, max: 72, step: 1, inputMode: "numeric" } }}
                            sx={inputSx}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setPublishDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handlePublicar}
                        disabled={
                            !form.titulo.trim() ||
                            !form.texto.trim() ||
                            !Number.isInteger(Number(form.duracaoHoras)) ||
                            Number(form.duracaoHoras) < 1 ||
                            Number(form.duracaoHoras) > 72
                        }
                        sx={{ bgcolor: "#008fd3", "&:hover": { bgcolor: "#007fbc" } }}
                    >
                        Publicar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(previewNotice)}
                onClose={() => setPreviewNotice(null)}
                fullWidth
                maxWidth="sm"
                aria-labelledby="dialog-visualizar-noticia"
            >
                <DialogTitle id="dialog-visualizar-noticia">Visualizar Notícia</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.5}>
                        <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
                            <Box component="span" sx={{ borderLeft: "1px solid #d0d7de", pl: 1, display: "inline-block" }}>
                                {previewNotice ? formatarDataHora(previewNotice.data, previewNotice.hora) : ""}
                            </Box>
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {previewNotice?.titulo}
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                            {previewNotice?.texto ?? previewNotice?.descricao}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
                            Duração: {previewNotice?.duracao ?? `${previewNotice?.duracaoHoras ?? 0}h`}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button variant="contained" onClick={() => setPreviewNotice(null)} sx={{ bgcolor: "#008fd3" }}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(confirmDeleteNotice)}
                onClose={() => setConfirmDeleteNotice(null)}
                aria-labelledby="dialog-remover-noticia"
            >
                <DialogTitle id="dialog-remover-noticia">Remover notícia</DialogTitle>
                <DialogContent>
                    <Typography>
                        Deseja remover a notícia <strong>{confirmDeleteNotice?.titulo}</strong>? Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteNotice(null)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={handleRemover}>
                        Remover
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((atual) => ({ ...atual, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
