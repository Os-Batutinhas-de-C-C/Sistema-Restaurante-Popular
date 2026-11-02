"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    Alert,
    Button,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { formatarData, obterDuracaoNoticia, resumirTexto } from "../../../utils/painelFormatadores";

function Acao({ label, onClick, children }) {
    return (
        <IconButton
            aria-label={label}
            onClick={onClick}
            sx={{
                width: { xs: 44, sm: 32 },
                height: { xs: 44, sm: 32 },
                bgcolor: "#0789cf",
                color: "common.white",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                "&:hover": { bgcolor: "#0578b8" },
            }}
        >
            {children}
        </IconButton>
    );
}

function AcoesNoticia({ noticia, onVisualizar, onExcluir }) {
    return (
        <Stack direction="row" spacing={0.75} sx={{ justifyContent: "flex-end" }}>
            <Acao label={"Visualizar notícia: " + noticia.titulo} onClick={() => onVisualizar(noticia)}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </Acao>
            <Acao label={"Excluir notícia: " + noticia.titulo} onClick={() => onExcluir(noticia)}>
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </Acao>
        </Stack>
    );
}

function EstadoLista({ children }) {
    return (
        <Paper
            variant="outlined"
            sx={{ p: 3, borderColor: "#e4e8eb", borderRadius: 2, textAlign: "center" }}
        >
            {children}
        </Paper>
    );
}

export default function ListaNoticias({ noticias, loading, error, onRetry, onVisualizar, onExcluir, isMobile }) {
    if (loading) {
        return (
            <Stack spacing={1}>
                <Skeleton variant="rounded" height={52} />
                <Skeleton variant="rounded" height={64} />
                <Skeleton variant="rounded" height={64} />
            </Stack>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                action={<Button color="inherit" size="small" onClick={onRetry}>Tentar novamente</Button>}
            >
                {error}
            </Alert>
        );
    }

    if (noticias.length === 0) {
        return (
            <EstadoLista>
                <Typography color="text.secondary">Nenhuma notícia no período selecionado.</Typography>
            </EstadoLista>
        );
    }

    if (isMobile) {
        return (
            <Stack spacing={1.5}>
                {noticias.map((noticia) => (
                    <Paper
                        key={noticia.id}
                        component="article"
                        variant="outlined"
                        sx={{ p: 1.75, borderColor: "#e4e8eb", borderRadius: 2 }}
                    >
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Stack spacing={0}>
                                <Typography component="time" variant="caption" color="text.secondary">{formatarData(noticia.data)}</Typography>
                                <Typography component="time" variant="caption" color="text.secondary">{noticia.hora}</Typography>
                            </Stack>
                            <Chip size="small" label={obterDuracaoNoticia(noticia)} color="primary" variant="outlined" />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>
                            {noticia.titulo}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                overflow: "hidden",
                            }}
                        >
                            {noticia.texto || noticia.descricao}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                            <AcoesNoticia noticia={noticia} onVisualizar={onVisualizar} onExcluir={onExcluir} />
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        );
    }

    return (
        <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderColor: "#e4e8eb", borderRadius: 2, overflowX: "hidden" }}
        >
            <Table size="small" aria-label="Lista de notícias e avisos" sx={{ width: "100%", tableLayout: "fixed" }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: "16%", fontWeight: 700 }}>Data</TableCell>
                        <TableCell sx={{ width: "25%", fontWeight: 700 }}>Título</TableCell>
                        <TableCell sx={{ width: "34%", fontWeight: 700 }}>Descrição</TableCell>
                        <TableCell sx={{ width: "12%", fontWeight: 700 }}>Duração</TableCell>
                        <TableCell sx={{ width: "13%" }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {noticias.map((noticia) => (
                        <TableRow key={noticia.id} hover>
                            <TableCell>
                                <Stack spacing={0}>
                                    <Typography variant="body2" fontWeight={600}>{formatarData(noticia.data)}</Typography>
                                    <Typography variant="caption" color="text.secondary">{noticia.hora}</Typography>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontWeight={700} noWrap title={noticia.titulo}>
                                    {noticia.titulo}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary" noWrap title={noticia.texto || noticia.descricao}>
                                    {resumirTexto(noticia.texto || noticia.descricao, 58)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontWeight={700}>{obterDuracaoNoticia(noticia)}</Typography>
                            </TableCell>
                            <TableCell>
                                <AcoesNoticia noticia={noticia} onVisualizar={onVisualizar} onExcluir={onExcluir} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
