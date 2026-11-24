"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from "@mui/material";
import { cancelarInscricaoComoGestor, consultarInscritos, formatarCpf, formatarDataOficina } from "../../services/oficinasService";
import { useAgendaOficinas } from "./useAgendaOficinas";

export default function DialogoInscritos({ evento, onClose, onAlteracao }) {
    const id = evento.id;
    const carregar = useCallback((signal) => consultarInscritos(id, signal), [id]);
    const { agenda, agora, erro, carregando, recarregar } = useAgendaOficinas(carregar);
    const [cancelando, setCancelando] = useState(null);
    const [removidos, setRemovidos] = useState([]);
    const [falha, setFalha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const permiteCancelar = agora < Date.parse(agenda?.inicioEm);
    const inscritos = (agenda?.inscricoes ?? []).filter(({ id }) => !removidos.includes(id));

    async function cancelar(inscricaoId) {
        setCancelando(inscricaoId);
        setFalha("");
        setMensagem("");
        try {
            await cancelarInscricaoComoGestor(id, inscricaoId);
            setRemovidos((anteriores) => [...anteriores, inscricaoId]);
            setMensagem("Inscrição cancelada.");
            recarregar();
            onAlteracao?.();
        } catch (erro) {
            setFalha(erro.message);
            recarregar();
        } finally {
            setCancelando(null);
        }
    }

    return (
        <Dialog open onClose={cancelando ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="titulo-inscritos">
            <DialogTitle id="titulo-inscritos">Inscritos</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{evento.title}</Typography>
                    {carregando && <Typography role="status">Carregando inscrições…</Typography>}
                    {erro && <Alert severity="error" action={<Button color="inherit" onClick={recarregar}>Tentar novamente</Button>}>{erro}</Alert>}
                    {falha && <Alert severity="error">{falha}</Alert>}
                    {mensagem && <Alert severity="success">{mensagem}</Alert>}
                    {agenda && !permiteCancelar && inscritos.length > 0 && (
                        <Typography variant="body2">O prazo de cancelamento terminou.</Typography>
                    )}
                    {agenda && inscritos.length === 0 && <Typography>Nenhuma inscrição.</Typography>}
                    {inscritos.map((inscrito) => (
                        <Paper key={inscrito.id} variant="outlined" sx={{ p: 2, overflowWrap: "anywhere" }}>
                            <Stack spacing={0.5}>
                                <Typography variant="body2"><strong>CPF</strong> {formatarCpf(inscrito.cpf)}</Typography>
                                <Typography variant="body2"><strong>Data de nascimento</strong> {formatarDataOficina(inscrito.dataNascimento)}</Typography>
                                <Typography variant="body2"><strong>E-mail</strong> {inscrito.email}</Typography>
                                <Button color="error" sx={{ alignSelf: "flex-start" }}
                                    disabled={!permiteCancelar || cancelando !== null}
                                    onClick={() => cancelar(inscrito.id)}>Cancelar inscrição</Button>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button component={Link} href={`/painel-gestor/oficinas-ou-cursos/${id}/frequencia`}>Lista de frequência</Button>
                <Button onClick={onClose} disabled={cancelando !== null}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
}
