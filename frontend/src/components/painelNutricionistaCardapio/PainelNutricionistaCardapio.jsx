"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Skeleton, Stack } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import useFichasDia from "../../services/useFichasDia";
import { dataIsoFortaleza } from "../../services/fichasService";
import { listarHistoricoCardapios, selecionarSugestoesSemana } from "../../services/gerenciamentoCardapioService";
import {
    dataDeIsoLocal,
    dataIsoLocal,
    mapearSemanaParaDias,
    obterSegundaIso,
    salvarCardapioSemanaApi,
} from "../../services/cardapiosApiService";
import {
    filtrarCardapiosPorIntervalo,
    listarDadosCardapio,
    obterGraficosSemana,
    obterIntervaloSemanaAtual,
} from "../../services/cardapioService.js";
import GraficosCardapio from "./GraficosCardapio/GraficosCardapio";
import ListaCardapios from "./ListaCardapios/ListaCardapios";
import ModalRefeicao from "./ModalRefeicao/ModalRefeicao";
import styles from "./painelNutricionistaCardapio.module.css";

function somarDias(data, quantidade) {
    const resultado = new Date(data);
    resultado.setDate(resultado.getDate() + quantidade);
    return resultado;
}

export default function PainelNutricionistaCardapio() {
    const router = useRouter();
    const fichasDia = useFichasDia();
    const [dataInicial] = useState(dataIsoFortaleza);
    const dataReferencia = fichasDia.dados?.data ?? fichasDia.dataReferencia ?? dataInicial;
    const [intervaloEscolhido, setIntervaloEscolhido] = useState(null);
    const intervaloSelecionado = useMemo(
        () => intervaloEscolhido ?? obterIntervaloSemanaAtual(dataReferencia),
        [intervaloEscolhido, dataReferencia],
    );
    const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(null);
    const [semanas, setSemanas] = useState([]);
    const [todosCardapios, setTodosCardapios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const loadSequence = useRef(0);
    const generationSequence = useRef(0);
    const [feedbackGeracao, setFeedbackGeracao] = useState(null);
    const [gerandoSemana, setGerandoSemana] = useState(false);

    const dataSegundaSelecionada = intervaloSelecionado?.from
        ? obterSegundaIso(intervaloSelecionado.from)
        : null;
    const dataDomingoSelecionada = dataSegundaSelecionada
        ? (() => {
            const domingo = dataDeIsoLocal(dataSegundaSelecionada);
            domingo.setDate(domingo.getDate() + 6);
            return dataIsoLocal(domingo);
        })()
        : null;
    const semanaValida = Boolean(
        intervaloSelecionado?.from
        && intervaloSelecionado?.to
        && dataIsoLocal(intervaloSelecionado.from) === dataSegundaSelecionada
        && dataIsoLocal(intervaloSelecionado.to) === dataDomingoSelecionada,
    );

    useEffect(() => {
        const sequence = ++loadSequence.current;
        let ativo = true;
        listarDadosCardapio()
            .then((resultado) => {
                if (ativo && sequence === loadSequence.current) {
                    setSemanas(resultado.semanas);
                    setTodosCardapios(resultado.cardapios);
                    setError("");
                }
            })
            .catch((erro) => {
                if (ativo && sequence === loadSequence.current) setError(erro?.message || "Não foi possível carregar os cardápios.");
            })
            .finally(() => {
                if (ativo && sequence === loadSequence.current) setLoading(false);
            });
        return () => {
            ativo = false;
            loadSequence.current += 1;
        };
    }, [refreshKey, dataReferencia]);

    const cardapios = useMemo(
        () => filtrarCardapiosPorIntervalo(todosCardapios, intervaloSelecionado),
        [todosCardapios, intervaloSelecionado],
    );
    const graficos = useMemo(
        () => obterGraficosSemana(semanas, intervaloSelecionado, fichasDia.dados, dataReferencia),
        [semanas, intervaloSelecionado, fichasDia.dados, dataReferencia],
    );

    const recarregar = () => {
        setLoading(true);
        setError("");
        setRefreshKey((atual) => atual + 1);
        fichasDia.recarregar();
    };

    const selecionarIntervalo = (intervalo) => {
        generationSequence.current += 1;
        setGerandoSemana(false);
        setIntervaloEscolhido(intervalo);
        setFeedbackGeracao(null);
    };

    const navegarPeriodo = (quantidadeSemanas) => {
        generationSequence.current += 1;
        setGerandoSemana(false);
        setFeedbackGeracao(null);
        setIntervaloEscolhido((atual) => {
            const referencia = atual ?? intervaloSelecionado;
            return {
                from: somarDias(referencia.from, quantidadeSemanas * 7),
                to: somarDias(referencia.to, quantidadeSemanas * 7),
            };
        });
    };

    const gerarSemana = async () => {
        if (!semanaValida || !dataSegundaSelecionada) return;
        const sequence = ++generationSequence.current;
        setGerandoSemana(true);
        setFeedbackGeracao(null);
        try {
            const historico = await listarHistoricoCardapios();
            const sugestoes = selecionarSugestoesSemana(historico);
            if (sequence !== generationSequence.current) return;
            if (!sugestoes) {
                setFeedbackGeracao({
                    severity: "info",
                    message: "O histórico não tem cinco combinações completas e distintas. Os cardápios salvos não foram alterados.",
                });
                return;
            }
            const semanaSalva = await salvarCardapioSemanaApi(dataSegundaSelecionada, sugestoes);
            if (sequence !== generationSequence.current) return;
            const diasSalvos = mapearSemanaParaDias(semanaSalva);
            const sexta = dataDeIsoLocal(dataSegundaSelecionada);
            sexta.setDate(sexta.getDate() + 4);
            const dataSexta = dataIsoLocal(sexta);
            setTodosCardapios((atuais) => [
                ...atuais.filter(({ dia }) => dia < dataSegundaSelecionada || dia > dataSexta),
                ...diasSalvos,
            ]);
            setSemanas((atuais) => [
                ...atuais.filter(({ data }) => data !== semanaSalva.data),
                semanaSalva,
            ].sort((a, b) => a.data.localeCompare(b.data)));
            setFeedbackGeracao({ severity: "success", message: "Cardápio da semana gerado e salvo com sucesso." });
        } catch (erro) {
            if (sequence === generationSequence.current) {
                setFeedbackGeracao({
                    severity: "error",
                    message: erro?.message || "Não foi possível gerar e salvar o cardápio da semana.",
                });
            }
        } finally {
            if (sequence === generationSequence.current) setGerandoSemana(false);
        }
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Box className={styles.layout}>
                    <GraficosCardapio
                        graficos={graficos}
                        erroFichas={fichasDia.error}
                        carregandoFichas={fichasDia.loading}
                        onRefreshFichas={fichasDia.recarregar}
                    />
                    {loading ? (
                        <Stack spacing={1}><Skeleton variant="rounded" height={56} /><Skeleton variant="rounded" height={210} /></Stack>
                    ) : error ? (
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={recarregar}>Tentar novamente</Button>}>{error}</Alert>
                    ) : (
                        <ListaCardapios
                            cardapios={cardapios}
                            intervaloSelecionado={intervaloSelecionado}
                            onSelectRange={selecionarIntervalo}
                            onPreviousRange={() => navegarPeriodo(-1)}
                            onNextRange={() => navegarPeriodo(1)}
                            onEdit={(date) => router.push(`/painel-nutricionista-cardapio/gerenciar/${date}`)}
                            onView={setRefeicaoSelecionada}
                            semanaValida={semanaValida}
                            feedbackGeracao={feedbackGeracao}
                            gerandoSemana={gerandoSemana}
                            controlesDesabilitados={gerandoSemana}
                            onGenerateWeek={gerarSemana}
                        />
                    )}
                </Box>
            </Box>
            <ModalRefeicao
                refeicao={refeicaoSelecionada}
                onClose={() => setRefeicaoSelecionada(null)}
            />
        </Box>
    );
}
