"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    Alert,
    Button,
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
import { formatarData, resumirTexto } from "../../../utils/painelFormatadores";

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

function AcoesMensagem({ mensagem, onVisualizar, onExcluir }) {
    return (
        <Stack direction="row" spacing={0.75}>
            <Acao label={"Visualizar mensagem: " + mensagem.titulo} onClick={() => onVisualizar(mensagem)}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </Acao>
            <Acao label={"Excluir mensagem: " + mensagem.titulo} onClick={() => onExcluir(mensagem)}>
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </Acao>
        </Stack>
    );
}

export default function ListaMensagens({ mensagens, loading, error, onRetry, onVisualizar, onExcluir, isMobile }) {
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
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Tentar novamente</Button>}>
                {error}
            </Alert>
        );
    }

    if (mensagens.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderColor: "#e4e8eb", borderRadius: 2, textAlign: "center" }}>
                <Typography color="text.secondary">Nenhuma mensagem no período selecionado.</Typography>
            </Paper>
        );
    }

    if (isMobile) {
        return (
            <Stack spacing={1.5}>
                {mensagens.map((mensagem) => (
                    <Paper
                        key={mensagem.id}
                        component="article"
                        variant="outlined"
                        sx={{ p: 1.75, borderColor: "#e4e8eb", borderRadius: 2 }}
                    >
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Typography component="time" variant="caption" fontWeight={700} color="text.secondary">
                                {formatarData(mensagem.data)}
                            </Typography>
                            <Typography component="time" variant="caption" color="text.secondary">{mensagem.hora}</Typography>
                        </Stack>
                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>
                            {mensagem.titulo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {resumirTexto(mensagem.texto, 90)}
                        </Typography>
                        <Stack direction="row" sx={{ mt: 1.25, justifyContent: "flex-end" }}>
                            <AcoesMensagem mensagem={mensagem} onVisualizar={onVisualizar} onExcluir={onExcluir} />
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#e4e8eb", borderRadius: 2, overflowX: "hidden" }}>
            <Table size="small" aria-label="Mensagens" sx={{ width: "100%", tableLayout: "fixed" }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: "16%", fontWeight: 700 }}>Data</TableCell>
                        <TableCell sx={{ width: "26%", fontWeight: 700 }}>Título</TableCell>
                        <TableCell sx={{ width: "45%", fontWeight: 700 }}>Descrição</TableCell>
                        <TableCell sx={{ width: "13%" }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {mensagens.map((mensagem) => (
                        <TableRow key={mensagem.id} hover>
                            <TableCell>
                                <Stack spacing={0}>
                                    <Typography variant="body2" fontWeight={600}>{formatarData(mensagem.data)}</Typography>
                                    <Typography variant="caption" color="text.secondary">{mensagem.hora}</Typography>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontWeight={700} noWrap title={mensagem.titulo}>
                                    {mensagem.titulo}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary" noWrap title={mensagem.texto}>
                                    {resumirTexto(mensagem.texto, 56)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <AcoesMensagem mensagem={mensagem} onVisualizar={onVisualizar} onExcluir={onExcluir} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
