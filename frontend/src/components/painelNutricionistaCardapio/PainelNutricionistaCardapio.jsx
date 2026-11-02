"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import {
    filtrarCardapiosPorIntervalo,
    obterDadosCardapioMockados,
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
    const dadosMockados = useMemo(() => obterDadosCardapioMockados(), []);
    const cardapios = useMemo(
        () => filtrarCardapiosPorIntervalo(dadosMockados.cardapios, intervaloSelecionado),
        [dadosMockados.cardapios, intervaloSelecionado],
    );

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
                    <GraficosCardapio graficos={dadosMockados.graficos} />
                    <ListaCardapios
                        cardapios={cardapios}
                        intervaloSelecionado={intervaloSelecionado}
                        onSelectRange={setIntervaloSelecionado}
                        onPreviousRange={() => navegarPeriodo(-1)}
                        onNextRange={() => navegarPeriodo(1)}
                        onEdit={(date) => router.push(`/painel-nutricionista-cardapio/gerenciar/${date}`)}
                        onView={setRefeicaoSelecionada}
                    />
                </Box>
            </Box>
            <ModalRefeicao
                refeicao={refeicaoSelecionada}
                onClose={() => setRefeicaoSelecionada(null)}
            />
        </Box>
    );
}
