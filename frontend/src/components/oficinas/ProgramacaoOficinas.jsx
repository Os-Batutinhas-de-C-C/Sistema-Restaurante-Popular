"use client";

import { useEffect } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import {
    consultarProgramacao, CUSTOS_OFICINA, estadoEvento, formatarDataOficina,
    formatarHorarioOficina, formatarVagas, TIPOS_OFICINA,
} from "../../services/oficinasService";
import { useAgendaOficinas } from "./useAgendaOficinas";

export function DataHorarioOficina({ evento }) {
    return `${formatarDataOficina(evento.data)} · ${formatarHorarioOficina(evento.horaInicio)} às ${formatarHorarioOficina(evento.horaFim)}`;
}

export function TituloSecaoOficinas({ id, children }) {
    return (
        <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: "center" }}>
            <Box component="span" aria-hidden="true" sx={{ width: 7, height: 7, flex: "0 0 auto", borderRadius: "50%", bgcolor: "#1d4ed8" }} />
            <Typography id={id} component="h2" variant="subtitle1" sx={{ fontWeight: 700, textTransform: "uppercase", color: "#101828" }} tabIndex={-1}>
                {children}
            </Typography>
        </Stack>
    );
}

function CardOficina({ evento, estado, onInscrever }) {
    const lotado = evento.vagasRestantes === "0";
    return (
        <Card component="article" variant="outlined" sx={{ height: "100%", display: "flex", borderRadius: 2, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)" }}>
            <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, p: 2.5, overflowWrap: "anywhere" }}>
                <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Chip size="small" label={TIPOS_OFICINA[evento.tipo]} />
                    <Chip size="small" variant="outlined" label={CUSTOS_OFICINA[evento.custo]} />
                    {estado === "EM_ANDAMENTO" && <Chip size="small" color="info" label="Em andamento" />}
                </Stack>
                <Typography component="h3" variant="h6" sx={{ fontWeight: 700 }}>{evento.title}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{evento.descricao}</Typography>
                <Box component="dl" sx={{ m: 0, "& dt": { fontWeight: 700 }, "& dd": { m: 0, mb: 1 } }}>
                    <Typography component="dt" variant="body2">Data e horário</Typography>
                    <Typography component="dd" variant="body2"><DataHorarioOficina evento={evento} /></Typography>
                    <Typography component="dt" variant="body2">Local</Typography>
                    <Typography component="dd" variant="body2">{evento.local}</Typography>
                    <Typography component="dt" variant="body2">Instrutor</Typography>
                    <Typography component="dd" variant="body2">{evento.instrutor}</Typography>
                    <Typography component="dt" variant="body2">Vagas</Typography>
                    <Typography component="dd" variant="body2">
                        {formatarVagas(evento.vagasRestantes)} disponíveis de {formatarVagas(evento.vagas)}
                    </Typography>
                </Box>
                {onInscrever && (
                    <Button variant="contained" sx={{ mt: "auto", alignSelf: "flex-start" }}
                        disabled={estado !== "PROGRAMADO" || lotado}
                        onClick={({ currentTarget }) => onInscrever(evento, currentTarget)}>
                        {estado !== "PROGRAMADO" ? "Inscrições encerradas" : lotado ? "Vagas esgotadas" : "Inscrever-se"}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export function useProgramacaoOficinas() {
    const consulta = useAgendaOficinas(consultarProgramacao, { revalidarNosLimites: true });
    const recarregar = consulta.recarregar;
    useEffect(() => {
        window.addEventListener("focus", recarregar);
        return () => window.removeEventListener("focus", recarregar);
    }, [recarregar]);
    return consulta;
}

export default function ProgramacaoOficinas({ consulta, onInscrever, acao }) {
    const { agenda, agora, carregando, erro, recarregar } = consulta;
    const eventos = (agenda?.eventos ?? []).filter((evento) => estadoEvento(evento, agora) !== "ENCERRADO");
    return (
        <Stack component="section" id="oficinas-ou-cursos" aria-labelledby="titulo-oficinas" spacing={2} sx={{ width: "100%", minWidth: 0 }}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1, justifyContent: "space-between", alignItems: { sm: "center" } }}>
                <TituloSecaoOficinas id="titulo-oficinas">Oficinas ou Cursos</TituloSecaoOficinas>
                {acao}
            </Stack>
            {carregando && <Typography role="status">Carregando programação…</Typography>}
            {erro && (
                <Alert severity="error" action={<Button color="inherit" onClick={recarregar}>Tentar novamente</Button>}>{erro}</Alert>
            )}
            {!carregando && !erro && eventos.length === 0 && <Typography>Nenhum evento disponível no momento.</Typography>}
            {eventos.length > 0 && (
                <Grid container spacing={2}>
                    {eventos.map((evento) => (
                        <Grid key={evento.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                            <CardOficina evento={evento} estado={estadoEvento(evento, agora)} onInscrever={onInscrever} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Stack>
    );
}
