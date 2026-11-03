"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Skeleton, Stack } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
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
    const [intervaloSelecionado, setIntervaloSelecionado] = useState(obterIntervaloSemanaAtual);
    const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(null);
    const [semanas, setSemanas] = useState([]);
    const [todosCardapios, setTodosCardapios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const loadSequence = useRef(0);

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
    }, [refreshKey]);

    const cardapios = useMemo(
        () => filtrarCardapiosPorIntervalo(todosCardapios, intervaloSelecionado),
        [todosCardapios, intervaloSelecionado],
    );
    const graficos = useMemo(() => obterGraficosSemana(semanas, intervaloSelecionado), [semanas, intervaloSelecionado]);

    const recarregar = () => {
        setLoading(true);
        setError("");
        setRefreshKey((atual) => atual + 1);
    };

    const navegarPeriodo = (quantidadeSemanas) => {
        setIntervaloSelecionado((atual) => ({
            from: somarDias(atual.from, quantidadeSemanas * 7),
            to: somarDias(atual.to, quantidadeSemanas * 7),
        }));
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Box className={styles.layout}>
                    <GraficosCardapio graficos={graficos} />
                    {loading ? (
                        <Stack spacing={1}><Skeleton variant="rounded" height={56} /><Skeleton variant="rounded" height={210} /></Stack>
                    ) : error ? (
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={recarregar}>Tentar novamente</Button>}>{error}</Alert>
                    ) : (
                        <ListaCardapios
                            cardapios={cardapios}
                            intervaloSelecionado={intervaloSelecionado}
                            onSelectRange={setIntervaloSelecionado}
                            onPreviousRange={() => navegarPeriodo(-1)}
                            onNextRange={() => navegarPeriodo(1)}
                            onEdit={(date) => router.push(`/painel-nutricionista-cardapio/gerenciar/${date}`)}
                            onView={setRefeicaoSelecionada}
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
