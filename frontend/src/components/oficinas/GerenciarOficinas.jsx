"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from "@mui/material";
import {
    consultarOficinas, CUSTOS_OFICINA, ESTADOS_OFICINA, estadoEvento, formatarVagas, removerOficina,
    ROTA_OFICINAS, TIPOS_OFICINA,
} from "../../services/oficinasService";
import { DataHorarioOficina } from "./ProgramacaoOficinas";
import { useAgendaOficinas } from "./useAgendaOficinas";
import DialogoInscritos from "./DialogoInscritos";
import PaginaOficinasGestor from "./PaginaOficinasGestor";
import { restaurarFoco } from "./restaurarFoco";

const SEM_FILTROS = { data: "", horaInicio: "", horaFim: "" };

export default function GerenciarOficinas() {
    const [filtros, setFiltros] = useState(SEM_FILTROS);
    const [aplicados, setAplicados] = useState(SEM_FILTROS);
    const [dialogo, setDialogo] = useState(null);
    const [removendo, setRemovendo] = useState(false);
    const [falha, setFalha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [removidos, setRemovidos] = useState([]);
    const acionadorDialogo = useRef(null);
    const carregar = useCallback((signal) => consultarOficinas(aplicados, signal), [aplicados]);
    const { agenda, agora, erro, carregando, recarregar } = useAgendaOficinas(carregar);
    const eventos = (agenda?.eventos ?? []).filter(({ id }) => !removidos.includes(id));

    function abrirDialogo(tipo, evento, acionador) {
        acionadorDialogo.current = acionador;
        setFalha("");
        setDialogo({ tipo, evento });
    }

    function fecharDialogo() {
        setDialogo(null);
        restaurarFoco(acionadorDialogo.current, "novo-evento");
    }

    async function remover() {
        setRemovendo(true);
        setFalha("");
        try {
            await removerOficina(dialogo.evento.id);
            setRemovidos((anteriores) => [...anteriores, dialogo.evento.id]);
            setMensagem("Evento removido.");
            fecharDialogo();
            recarregar();
        } catch (erro) {
            setFalha(erro.message);
        } finally {
            setRemovendo(false);
        }
    }

    return (
        <PaginaOficinasGestor titulo="Gerenciar Oficinas ou Cursos" voltar="/painel-gestor" labelVoltar="Voltar ao Painel Gestor"
            acao={<Button id="novo-evento" component={Link} href={`${ROTA_OFICINAS}/novo`} variant="contained">Novo evento</Button>}>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack component="form" onSubmit={(event) => {
                    event.preventDefault();
                    setAplicados(filtros);
                }} direction={{ xs: "column", md: "row" }} sx={{ gap: 2, alignItems: { md: "center" } }}>
                    {Object.entries({ data: "Data", horaInicio: "Horário de início", horaFim: "Horário de fim" }).map(([campo, label]) => (
                        <TextField key={campo} label={label} type={campo === "data" ? "date" : "time"} value={filtros[campo]}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: campo === "data" ? undefined : { step: "any" } }}
                            onChange={({ target }) => setFiltros({ ...filtros, [campo]: target.value })} />
                    ))}
                    <Button type="submit" variant="outlined">Filtrar</Button>
                    <Button onClick={() => { setFiltros(SEM_FILTROS); setAplicados(SEM_FILTROS); }}>Limpar filtros</Button>
                </Stack>
            </Paper>
            {mensagem && <Alert severity="success" onClose={() => setMensagem("")}>{mensagem}</Alert>}
            {carregando && <Typography role="status">Carregando eventos…</Typography>}
            {erro && <Alert severity="error" action={<Button color="inherit" onClick={recarregar}>Tentar novamente</Button>}>{erro}</Alert>}
            {!carregando && !erro && eventos.length === 0 && <Typography>Nenhum evento para os filtros selecionados.</Typography>}
            <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0 }}>
                {eventos.map((evento) => {
                    const estado = estadoEvento(evento, agora);
                    return (
                        <Paper component="li" key={evento.id} variant="outlined" sx={{ p: 2 }}>
                            <Stack direction={{ xs: "column", md: "row" }}
                                sx={{ gap: 2, justifyContent: "space-between", alignItems: { md: "center" } }}>
                                <Box sx={{ overflowWrap: "anywhere", minWidth: 0 }}>
                                    <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: "wrap" }}>
                                        <Chip size="small" label={TIPOS_OFICINA[evento.tipo]} />
                                        <Chip size="small" variant="outlined" label={CUSTOS_OFICINA[evento.custo]} />
                                        <Chip size="small" variant="outlined" label={ESTADOS_OFICINA[estado]} />
                                    </Stack>
                                    <Typography variant="h6" component="h2">{evento.title}</Typography>
                                    <Typography variant="body2"><DataHorarioOficina evento={evento} /></Typography>
                                    <Typography variant="body2">{evento.local}</Typography>
                                    <Typography variant="body2">
                                        {formatarVagas(evento.vagasRestantes)} disponíveis de {formatarVagas(evento.vagas)}
                                    </Typography>
                                </Box>
                                <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
                                    <Button component={Link} href={`${ROTA_OFICINAS}/${evento.id}/frequencia`}>Lista de frequência</Button>
                                    <Button onClick={({ currentTarget }) => abrirDialogo("inscritos", evento, currentTarget)}>Ver inscritos</Button>
                                    {estado !== "ENCERRADO" && (
                                        <Button component={Link} href={`${ROTA_OFICINAS}/${evento.id}/editar`}>Editar</Button>
                                    )}
                                    <Button color="error" onClick={({ currentTarget }) => abrirDialogo("remover", evento, currentTarget)}>Remover</Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>
            {dialogo?.tipo === "inscritos" && <DialogoInscritos evento={dialogo.evento} onAlteracao={recarregar} onClose={fecharDialogo} />}
            {dialogo?.tipo === "remover" && (
                <Dialog open onClose={removendo ? undefined : fecharDialogo} fullWidth maxWidth="xs"
                    aria-labelledby="titulo-remover-oficina">
                    <DialogTitle id="titulo-remover-oficina">Remover evento?</DialogTitle>
                    <DialogContent sx={{ overflowWrap: "anywhere" }}>
                        <Typography>O evento {dialogo.evento.title} e todas as inscrições serão excluídos permanentemente.</Typography>
                        {falha && <Alert severity="error" sx={{ mt: 2 }}>{falha}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={fecharDialogo} disabled={removendo}>Cancelar</Button>
                        <Button color="error" variant="contained" onClick={remover} disabled={removendo}>Remover evento</Button>
                    </DialogActions>
                </Dialog>
            )}
        </PaginaOficinasGestor>
    );
}
