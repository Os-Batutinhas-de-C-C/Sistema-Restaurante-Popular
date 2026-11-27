"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import {
    consultarOficina, CUSTOS_OFICINA, estadoEvento, formatarHorarioOficina, ROTA_OFICINAS, salvarOficina, TIPOS_OFICINA,
} from "../../services/oficinasService";
import DialogoInscritos from "./DialogoInscritos";
import PaginaOficinasGestor from "./PaginaOficinasGestor";
import { useAgendaOficinas } from "./useAgendaOficinas";
import { restaurarFoco } from "./restaurarFoco";

const INICIAL = {
    title: "", tipo: "", vagas: "", descricao: "", data: "", horaInicio: "", horaFim: "",
    local: "", instrutor: "", custo: "",
};

function dadosIniciais(evento) {
    if (!evento) return INICIAL;
    return {
        ...Object.fromEntries(Object.keys(INICIAL).map((campo) => [campo, evento[campo]])),
        horaInicio: formatarHorarioOficina(evento.horaInicio),
        horaFim: formatarHorarioOficina(evento.horaFim),
    };
}

const tamanho = (texto) => [...texto.trim()].length;

function Editor({ evento, versao, encerrado }) {
    const router = useRouter();
    const [dados, setDados] = useState(() => dadosIniciais(evento));
    const [erro, setErro] = useState("");
    const [confirmacao, setConfirmacao] = useState(null);
    const [ocupado, setOcupado] = useState(false);
    const [verInscritos, setVerInscritos] = useState(false);
    const acionadorDialogo = useRef(null);
    const desabilitado = ocupado || encerrado;

    function alterar(campo, valor) {
        const normalizado = campo === "local" || campo === "instrutor"
            ? valor.toLocaleUpperCase("pt-BR").normalize("NFC") : valor;
        setDados((anteriores) => ({ ...anteriores, [campo]: normalizado }));
    }

    async function salvar(entrada) {
        setOcupado(true);
        setErro("");
        try {
            await salvarOficina(evento?.id, entrada);
            setConfirmacao(null);
            router.replace(ROTA_OFICINAS);
        } catch (falha) {
            if (falha.code === "REAGENDAMENTO_REQUER_CONFIRMACAO") {
                setConfirmacao({ entrada, ...falha.details });
            } else {
                setConfirmacao(null);
                setErro(falha.message);
            }
            setOcupado(false);
        }
    }

    function enviar(submissao) {
        submissao.preventDefault();
        if (tamanho(dados.title) > 60 || tamanho(dados.local) > 150 || tamanho(dados.instrutor) > 150) {
            setErro("Use até 60 caracteres no título e até 150 no local e no instrutor.");
            return;
        }
        if (!/^[\p{L} ]+$/u.test(dados.instrutor.trim())) {
            setErro("O instrutor deve conter apenas letras e espaços.");
            return;
        }
        acionadorDialogo.current = submissao.nativeEvent.submitter;
        salvar({ ...dados, versao });
    }

    function fecharConfirmacao() {
        setConfirmacao(null);
        restaurarFoco(acionadorDialogo.current, "titulo-pagina-oficinas");
    }

    function fecharInscritos() {
        setVerInscritos(false);
        restaurarFoco(acionadorDialogo.current, "titulo-pagina-oficinas");
    }

    function campo(nome, label, opcoes = {}) {
        return (
            <TextField fullWidth required name={nome} label={label} value={dados[nome]}
                onChange={({ target }) => alterar(nome, target.value)} disabled={desabilitado} {...opcoes} />
        );
    }

    return (
        <>
            {encerrado && <Alert severity="info">Este evento já terminou. A remoção está disponível na lista de eventos.</Alert>}
            {erro && <Alert severity="error">{erro}</Alert>}
            <Paper component="form" onSubmit={enviar} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 8 }}>{campo("title", "Título", { helperText: `${tamanho(dados.title)} de 60 caracteres` })}</Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>{campo("tipo", "Tipo", {
                            select: true, children: Object.entries(TIPOS_OFICINA).map(([valor, label]) =>
                                <MenuItem key={valor} value={valor}>{label}</MenuItem>),
                        })}</Grid>
                        <Grid size={12}>{campo("descricao", "Descrição", { multiline: true, minRows: 3 })}</Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>{campo("data", "Data", {
                            type: "date", slotProps: { inputLabel: { shrink: true } },
                        })}</Grid>
                        {Object.entries({ horaInicio: "Horário de início", horaFim: "Horário de fim" }).map(([nome, label]) => (
                            <Grid key={nome} size={{ xs: 12, sm: 4 }}>{campo(nome, label, {
                                type: "time", slotProps: { inputLabel: { shrink: true }, htmlInput: { step: "any" } },
                            })}</Grid>
                        ))}
                        <Grid size={{ xs: 12, sm: 6 }}>{campo("local", "Local", { helperText: `${tamanho(dados.local)} de 150 caracteres` })}</Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>{campo("instrutor", "Instrutor", { helperText: "Somente letras e espaços. Até 150 caracteres." })}</Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>{campo("vagas", "Total de vagas", {
                            slotProps: { htmlInput: { inputMode: "numeric", pattern: "0*[1-9][0-9]*" } },
                        })}</Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>{campo("custo", "Custo", {
                            select: true, children: Object.entries(CUSTOS_OFICINA).map(([valor, label]) =>
                                <MenuItem key={valor} value={valor}>{label}</MenuItem>),
                        })}</Grid>
                    </Grid>
                    <Typography variant="body2" color="text.secondary">Horários de Fortaleza.</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        {!encerrado && <Button variant="contained" type="submit" disabled={ocupado}>Salvar e publicar</Button>}
                        {evento && <Button variant="outlined" onClick={({ currentTarget }) => {
                            acionadorDialogo.current = currentTarget;
                            setVerInscritos(true);
                        }} disabled={ocupado}>Ver inscritos</Button>}
                    </Stack>
                </Stack>
            </Paper>
            {verInscritos && <DialogoInscritos evento={evento} onClose={fecharInscritos} />}
            {confirmacao && (
                <Dialog open onClose={ocupado ? undefined : fecharConfirmacao} fullWidth maxWidth="xs"
                    aria-labelledby="titulo-reagendamento">
                    <DialogTitle id="titulo-reagendamento">Confirmar reagendamento?</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {confirmacao.quantidade === 0
                                ? "A lista de conflitos mudou. Todas as inscrições serão mantidas com este horário."
                                : `Inscrições que serão canceladas neste evento por conflito de horário: ${confirmacao.quantidade}.`}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ flexWrap: "wrap" }}>
                        <Button onClick={fecharConfirmacao} disabled={ocupado}>Voltar à edição</Button>
                        <Button variant="contained" disabled={desabilitado}
                            onClick={() => salvar({ ...confirmacao.entrada, confirmacao: confirmacao.confirmacao })}>
                            Confirmar reagendamento
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

function EditarOficina({ id }) {
    const carregar = useCallback(async (signal) => {
        const resposta = await consultarOficina(id, signal);
        return { ...resposta, eventos: [resposta.evento] };
    }, [id]);
    const { agenda, agora, erro, carregando, recarregar } = useAgendaOficinas(carregar);
    return (
        <>
            {carregando && <Typography role="status">Carregando evento…</Typography>}
            {erro && <Alert severity="error" action={<Button color="inherit" onClick={recarregar}>Tentar novamente</Button>}>{erro}</Alert>}
            {agenda && <Editor key={agenda.evento.id} evento={agenda.evento} versao={agenda.versao}
                encerrado={estadoEvento(agenda.evento, agora) === "ENCERRADO"} />}
        </>
    );
}

export default function FormularioOficina({ id }) {
    return (
        <PaginaOficinasGestor titulo={id ? "Editar evento" : "Novo evento"} voltar={ROTA_OFICINAS} labelVoltar="Voltar aos eventos">
            <Box sx={{ width: "100%", maxWidth: 920 }}>
                <Stack spacing={2}>{id ? <EditarOficina id={id} /> : <Editor />}</Stack>
            </Box>
        </PaginaOficinasGestor>
    );
}
