"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import {
    consultarFrequenciaOficina, formatarCpf, formatarDataOficina, ROTA_OFICINAS,
    salvarFrequenciaOficina, TIPOS_OFICINA,
} from "../../../services/oficinasService";
import PaginaOficinasGestor from "../PaginaOficinasGestor";
import { marcarHorario, useAgendaOficinas } from "../useAgendaOficinas";
import ResumoFrequencia from "./ResumoFrequencia/ResumoFrequencia";
import CartaoInscritoFrequencia from "./CartaoInscritoFrequencia/CartaoInscritoFrequencia";

const formatarHora = (hora) => hora?.slice(0, 5) ?? "";

export default function PaginaFrequenciaOficina({ id }) {
    const [dados, setDados] = useState(null);
    const [inscricoes, setInscricoes] = useState([]);
    const [busca, setBusca] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [exportando, setExportando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const carregar = useCallback(async (signal) => {
        const resposta = await consultarFrequenciaOficina(id, signal);
        setDados(resposta);
        setInscricoes(resposta.inscricoes ?? []);
        return marcarHorario({ ...resposta, inicioEm: resposta.evento.inicioEm });
    }, [id]);
    const { agora, erro: erroCarregamento, carregando, recarregar } = useAgendaOficinas(carregar);

    const evento = dados?.evento;
    const semInscritos = inscricoes.length === 0;
    const permiteEditar = Boolean(evento && agora >= Date.parse(evento.inicioEm));
    const alterado = useMemo(() => {
        const salvas = new Map((dados?.inscricoes ?? []).map((item) => [item.id, item.presente]));
        return inscricoes.some((item) => salvas.get(item.id) !== item.presente);
    }, [dados, inscricoes]);
    const totais = useMemo(() => ({
        inscritos: inscricoes.length,
        presentes: inscricoes.filter((item) => item.presente).length,
        ausentes: inscricoes.filter((item) => !item.presente).length,
    }), [inscricoes]);
    const filtradas = useMemo(() => {
        const consulta = busca.trim().toLocaleLowerCase("pt-BR");
        if (!consulta) return inscricoes;
        const digitos = consulta.replace(/\D/g, "");
        return inscricoes.filter((item) => {
            const cpf = (item.cpf ?? "").replace(/\D/g, "");
            const email = (item.email ?? "").toLocaleLowerCase("pt-BR");
            return (digitos && cpf.includes(digitos)) || email.includes(consulta);
        });
    }, [busca, inscricoes]);

    function alterarInscrito(idInscricao, presente) {
        setInscricoes((atuais) => atuais.map((item) => item.id === idInscricao ? { ...item, presente } : item));
        setErro("");
        setSucesso("");
    }

    function alterarTodos(presente) {
        setInscricoes((atuais) => atuais.map((item) => ({ ...item, presente })));
        setErro("");
        setSucesso("");
    }

    async function salvar() {
        if (!permiteEditar || semInscritos || !alterado) return;
        setSalvando(true);
        setErro("");
        setSucesso("");
        try {
            const resposta = await salvarFrequenciaOficina(id, inscricoes.map(({ id: inscricaoId, presente }) => ({
                inscricaoId,
                presente,
            })));
            setDados(resposta);
            setInscricoes(resposta.inscricoes ?? []);
            setSucesso("Frequência salva com sucesso.");
        } catch (falha) {
            setErro(falha.message || "Não foi possível salvar a frequência. Suas alterações continuam nesta tela.");
        } finally {
            setSalvando(false);
        }
    }

    async function exportarPdf() {
        if (semInscritos || alterado || !dados) {
            if (alterado) setErro("Salve a frequência antes de exportar o PDF.");
            return;
        }
        setExportando(true);
        setErro("");
        try {
            const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
            const autoTable = autoTableModule.default;
            const documento = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            const tipo = TIPOS_OFICINA[evento.tipo] ?? evento.tipo;
            documento.setFontSize(16);
            documento.text(evento.title, 14, 17, { maxWidth: 265 });
            documento.setFontSize(10);
            const detalhes = [
                `Tipo: ${tipo}`,
                `Data: ${formatarDataOficina(evento.data)}`,
                `Horário: ${formatarHora(evento.horaInicio)} às ${formatarHora(evento.horaFim)}`,
                `Local: ${evento.local}`,
                `Instrutor: ${evento.instrutor}`,
            ];
            detalhes.forEach((linha, indice) => documento.text(linha, 14, 25 + indice * 6, { maxWidth: 265 }));
            autoTable(documento, {
                startY: 58,
                head: [["CPF", "Data de nascimento", "E-mail", "Frequência"]],
                body: inscricoes.map((item) => [
                    formatarCpf(item.cpf), formatarDataOficina(item.dataNascimento), item.email || "Não informado",
                    item.presente ? "Presente" : "Ausente",
                ]),
                styles: { font: "helvetica", fontSize: 9, overflow: "linebreak", cellPadding: 2.5 },
                headStyles: { fillColor: [25, 118, 210] },
                columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 42 }, 2: { cellWidth: "auto" }, 3: { cellWidth: 35 } },
                margin: { left: 14, right: 14 },
            });
            const y = (documento.lastAutoTable?.finalY ?? 58) + 9;
            if (y > 185) documento.addPage();
            const yResumo = y > 185 ? 20 : y;
            documento.setFontSize(11);
            documento.text(`Total de inscritos: ${totais.inscritos}    Presentes: ${totais.presentes}    Ausentes: ${totais.ausentes}`, 14, yResumo);
            documento.save(`frequencia-${id}.pdf`);
        } catch {
            setErro("Não foi possível gerar o PDF. Tente novamente.");
        } finally {
            setExportando(false);
        }
    }

    return (
        <PaginaOficinasGestor titulo="Lista de frequência" voltar={ROTA_OFICINAS} labelVoltar="Voltar aos eventos">
            <Stack spacing={2}>
                {carregando && <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={20} />Carregando frequência…</Box>}
                {erroCarregamento && <Alert severity="error" action={<Button color="inherit" onClick={recarregar}>Tentar novamente</Button>}>{erroCarregamento}</Alert>}
                {erro && <Alert severity="error" onClose={() => setErro("")}>{erro}</Alert>}
                {sucesso && <Alert severity="success" onClose={() => setSucesso("")}>{sucesso}</Alert>}
                {evento && <>
                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h5" component="h2" sx={{ overflowWrap: "anywhere" }}>{evento.title}</Typography>
                        <Typography color="text.secondary">
                            {TIPOS_OFICINA[evento.tipo] ?? evento.tipo} · {formatarDataOficina(evento.data)} · {formatarHora(evento.horaInicio)}–{formatarHora(evento.horaFim)}
                        </Typography>
                        <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{evento.local} · {evento.instrutor}</Typography>
                    </Paper>
                    <ResumoFrequencia totais={totais} />
                    {!permiteEditar && <Alert severity="info">A frequência poderá ser editada a partir do início do evento.</Alert>}
                    {!permiteEditar && alterado && <Alert severity="warning">As alterações ainda não foram salvas e serão descartadas ao sair desta tela.</Alert>}
                    {alterado && <Alert severity="info">Salve a frequência antes de exportar o PDF.</Alert>}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <TextField label="Buscar por CPF ou e-mail" value={busca} onChange={(event) => setBusca(event.target.value)} fullWidth />
                        <Button variant="outlined" disabled={!permiteEditar || semInscritos || salvando} onClick={() => alterarTodos(true)}>Marcar todos</Button>
                        <Button variant="outlined" disabled={!permiteEditar || semInscritos || salvando} onClick={() => alterarTodos(false)}>Desmarcar todos</Button>
                    </Stack>
                    {semInscritos && !carregando && dados && <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}><Typography>Nenhuma inscrição para este evento.</Typography></Paper>}
                    <Stack spacing={1.5}>
                        {filtradas.map((item) => (
                            <CartaoInscritoFrequencia key={item.id} inscrito={item} disabled={!permiteEditar || salvando} onChange={alterarInscrito} />
                        ))}
                        {!semInscritos && filtradas.length === 0 && <Typography>Nenhum inscrito corresponde à busca.</Typography>}
                    </Stack>
                    <Divider />
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                        <Button component={Link} href={ROTA_OFICINAS} disabled={salvando}>Voltar</Button>
                        <Button variant="outlined" onClick={exportarPdf} disabled={semInscritos || alterado || exportando || carregando}>
                            {exportando ? "Gerando PDF…" : "Exportar PDF"}
                        </Button>
                        <Button variant="contained" onClick={salvar} disabled={!permiteEditar || semInscritos || !alterado || salvando || carregando}>
                            {salvando ? "Salvando…" : "Salvar frequência"}
                        </Button>
                    </Stack>
                </>}
            </Stack>
        </PaginaOficinasGestor>
    );
}
