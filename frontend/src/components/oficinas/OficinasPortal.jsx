"use client";

import { useRef, useState } from "react";
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, TextField, Typography,
} from "@mui/material";
import {
    cancelarMinhaInscricao, consultarMinhasInscricoes, estadoEvento, formatarCpf, inscreverEmOficina,
} from "../../services/oficinasService";
import ProgramacaoOficinas, { DataHorarioOficina, useProgramacaoOficinas } from "./ProgramacaoOficinas";
import { marcarHorario, useHorarioAgenda } from "./useAgendaOficinas";
import { restaurarFoco } from "./restaurarFoco";

const IDENTIDADE_INICIAL = { cpf: "", dataNascimento: "" };

function CamposIdentidade({ valores, onChange, disabled }) {
    return (
        <>
            <TextField label="CPF" required value={valores.cpf} disabled={disabled}
                autoComplete="off" placeholder="000.000.000-00"
                slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}" } }}
                onChange={({ target }) => onChange({ ...valores, cpf: formatarCpf(target.value) })} />
            <TextField label="Data de nascimento" type="date" required value={valores.dataNascimento} disabled={disabled}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={({ target }) => onChange({ ...valores, dataNascimento: target.value })} />
        </>
    );
}

function DialogoInscricao({ evento, onClose, onInscrito }) {
    const [dados, setDados] = useState({ ...IDENTIDADE_INICIAL, email: "" });
    const [ocupado, setOcupado] = useState(false);
    const [erro, setErro] = useState("");

    async function inscrever(submissao) {
        submissao.preventDefault();
        setOcupado(true);
        setErro("");
        try {
            await inscreverEmOficina(evento.id, dados);
            onInscrito(evento.title);
        } catch (falha) {
            setErro(falha.message);
        } finally {
            setOcupado(false);
        }
    }

    return (
        <Dialog open onClose={ocupado ? undefined : onClose} fullWidth maxWidth="xs" aria-labelledby="titulo-inscricao">
            <Box component="form" onSubmit={inscrever}>
                <DialogTitle id="titulo-inscricao">Inscrever-se</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Box>
                            <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{evento.title}</Typography>
                            <Typography variant="body2"><DataHorarioOficina evento={evento} /></Typography>
                        </Box>
                        {erro && <Alert severity="error">{erro}</Alert>}
                        <CamposIdentidade valores={dados} onChange={setDados} disabled={ocupado} />
                        <TextField label="E-mail" type="email" required value={dados.email} disabled={ocupado}
                            onChange={({ target }) => setDados({ ...dados, email: target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ flexWrap: "wrap" }}>
                    <Button onClick={onClose} disabled={ocupado}>Fechar</Button>
                    <Button type="submit" variant="contained" disabled={ocupado}>Confirmar inscrição</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

function MinhasInscricoes({ consulta, setConsulta, onAlteracao }) {
    const [dados, setDados] = useState(IDENTIDADE_INICIAL);
    const [ocupado, setOcupado] = useState(false);
    const [erro, setErro] = useState("");
    const agenda = consulta?.agenda ?? null;
    const agora = useHorarioAgenda(agenda);
    const eventos = (agenda?.eventos ?? []).filter((evento) => estadoEvento(evento, agora) !== "ENCERRADO");

    async function consultar(submissao) {
        submissao.preventDefault();
        setOcupado(true);
        setErro("");
        setConsulta(null);
        try {
            const agenda = await consultarMinhasInscricoes(dados);
            setConsulta({ identidade: dados, agenda: marcarHorario(agenda) });
        } catch (falha) {
            setErro(falha.message);
        } finally {
            setOcupado(false);
        }
    }

    async function cancelar(evento) {
        setOcupado(true);
        setErro("");
        try {
            await cancelarMinhaInscricao(evento.id, consulta.identidade);
            setConsulta((anterior) => anterior && ({
                ...anterior, agenda: { ...anterior.agenda, eventos: anterior.agenda.eventos.filter(({ id }) => id !== evento.id) },
            }));
            onAlteracao("Inscrição cancelada.");
        } catch (falha) {
            setErro(falha.message);
        } finally {
            setOcupado(false);
        }
    }

    return (
        <Stack component="section" id="minhas-inscricoes" aria-labelledby="titulo-minhas-inscricoes" spacing={2}>
            <Typography component="h2" variant="h5" id="titulo-minhas-inscricoes">Minhas inscrições</Typography>
            <Stack component="form" onSubmit={consultar} direction={{ xs: "column", md: "row" }}
                gap={2} alignItems={{ md: "center" }}>
                <CamposIdentidade valores={dados} disabled={ocupado} onChange={(novo) => {
                    setDados(novo);
                    setConsulta(null);
                    setErro("");
                }} />
                <Button type="submit" variant="outlined" disabled={ocupado}>Consultar inscrições</Button>
            </Stack>
            {ocupado && <Typography role="status">Processando…</Typography>}
            {erro && <Alert severity="error">{erro}</Alert>}
            {agenda && eventos.length === 0 && <Typography>Nenhuma inscrição futura ou em andamento encontrada.</Typography>}
            {eventos.length > 0 && (
                <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
                    {eventos.map((evento) => {
                        const iniciou = estadoEvento(evento, agora) === "EM_ANDAMENTO";
                        return (
                            <Paper key={evento.id} component="li" variant="outlined" sx={{ p: 2 }}>
                                <Stack direction={{ xs: "column", sm: "row" }} gap={1}
                                    justifyContent="space-between" alignItems={{ sm: "center" }}>
                                    <Box sx={{ overflowWrap: "anywhere" }}>
                                        <Typography fontWeight={700}>{evento.title}</Typography>
                                        <Typography variant="body2"><DataHorarioOficina evento={evento} /></Typography>
                                        {iniciou && <Typography variant="body2">Em andamento</Typography>}
                                    </Box>
                                    <Button color="error" disabled={ocupado || iniciou} onClick={() => cancelar(evento)}>
                                        Cancelar inscrição
                                    </Button>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
}

export default function OficinasPortal() {
    const programacao = useProgramacaoOficinas();
    const [evento, setEvento] = useState(null);
    const [consulta, setConsulta] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const acionadorInscricao = useRef(null);

    function fecharInscricao() {
        setEvento(null);
        restaurarFoco(acionadorInscricao.current, "titulo-oficinas");
    }

    function atualizar(texto) {
        setMensagem(texto);
        programacao.recarregar();
    }

    function confirmarInscricao(titulo) {
        fecharInscricao();
        atualizar(`Inscrição confirmada para ${titulo}.`);
        if (consulta) {
            const anterior = consulta;
            consultarMinhasInscricoes(anterior.identidade)
                .then((agenda) => setConsulta((atual) =>
                    atual === anterior ? { ...atual, agenda: marcarHorario(agenda) } : atual))
                .catch(() => setConsulta((atual) => atual === anterior ? null : atual));
        }
    }

    return (
        <Box className="boxes">
            <Stack className="boxBorder" spacing={4} sx={{ width: "100%", minWidth: 0, p: { xs: 2, md: 3 } }}>
                <ProgramacaoOficinas consulta={programacao} onInscrever={(selecionado, acionador) => {
                    acionadorInscricao.current = acionador;
                    setMensagem("");
                    setEvento(selecionado);
                }} />
                <MinhasInscricoes consulta={consulta} setConsulta={setConsulta} onAlteracao={atualizar} />
                {evento && <DialogoInscricao evento={evento} onClose={fecharInscricao} onInscrito={confirmarInscricao} />}
                <Snackbar open={Boolean(mensagem)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                    <Alert severity="success" onClose={() => setMensagem("")}>{mensagem}</Alert>
                </Snackbar>
            </Stack>
        </Box>
    );
}
