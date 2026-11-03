"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Snackbar } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import FormularioCardapio from "./FormularioCardapio/FormularioCardapio";
import ModalHistorico from "./ModalHistorico/ModalHistorico";
import NavegacaoDias from "./NavegacaoDias/NavegacaoDias";
import {
    cardapioVazio, dataDeIsoLocal, dataIsoLocal, formatarIntervaloSemana,
    obterDiasUteisDaSemana, salvarCardapioDia,
} from "../../services/gerenciamentoCardapioService";
import { mapearSemanaParaDias, obterSemanaApi } from "../../services/cardapiosApiService";
import styles from "./gerenciarCardapio.module.css";

function criarEstadoInicial(dataSolicitada) {
    const referencia = dataSolicitada ? dataDeIsoLocal(dataSolicitada) : new Date();
    const dias = obterDiasUteisDaSemana(referencia);
    const dataHoje = dataIsoLocal(new Date());
    const dataSelecionada = dias.some(({ data }) => data === dataSolicitada)
        ? dataSolicitada
        : dias.some(({ data }) => data === dataHoje)
            ? dataHoje
            : dias[0].data;
    return { dias, dataSelecionada };
}

export default function GerenciarCardapio({ dataSolicitada }) {
    const router = useRouter();
    const [estadoInicial] = useState(() => criarEstadoInicial(dataSolicitada));
    const [dias, setDias] = useState(estadoInicial.dias);
    const [dataSelecionada, setDataSelecionada] = useState(estadoInicial.dataSelecionada);
    const [cardapiosSalvos, setCardapiosSalvos] = useState({});
    const [formulario, setFormulario] = useState(() => cardapioVazio);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState(false);

    const diaSelecionado = dias.find(({ data }) => data === dataSelecionada) ?? dias[0];
    const intervalo = useMemo(() => formatarIntervaloSemana(dias), [dias]);

    const carregarSemana = useCallback(async (diasSemana, dataDoFormulario) => {
        try {
            const semana = await obterSemanaApi(diasSemana[0].data);
            const salvos = semana
                ? Object.fromEntries(mapearSemanaParaDias(semana).map(({ dia, refeicao }) => [dia, refeicao ?? cardapioVazio]))
                : {};
            setCardapiosSalvos(salvos);
            setFormulario(salvos[dataDoFormulario] ?? cardapioVazio);
        } catch (erro) {
            setError(erro?.message || "Não foi possível carregar o cardápio da semana.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let ativo = true;
        obterSemanaApi(estadoInicial.dias[0].data)
            .then((semana) => {
                if (!ativo) return;
                const salvos = semana
                    ? Object.fromEntries(mapearSemanaParaDias(semana).map(({ dia, refeicao }) => [dia, refeicao ?? cardapioVazio]))
                    : {};
                setCardapiosSalvos(salvos);
                setFormulario(salvos[estadoInicial.dataSelecionada] ?? cardapioVazio);
                setError("");
            })
            .catch((erro) => {
                if (ativo) setError(erro?.message || "Não foi possível carregar o cardápio da semana.");
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });
        return () => { ativo = false; };
    }, [estadoInicial]);

    const selecionarDia = (data) => {
        setDataSelecionada(data);
        setFormulario(cardapiosSalvos[data] ?? cardapioVazio);
    };

    const navegarSemana = (direcao) => {
        const indiceDia = dias.findIndex(({ data }) => data === dataSelecionada);
        const dataBase = dataDeIsoLocal(dias[0].data);
        dataBase.setDate(dataBase.getDate() + direcao * 7);
        const novosDias = obterDiasUteisDaSemana(dataBase);
        const novaData = novosDias[Math.min(Math.max(indiceDia, 0), 4)].data;
        setDias(novosDias);
        setDataSelecionada(novaData);
        setFormulario(cardapioVazio);
        setLoading(true);
        setError("");
        carregarSemana(novosDias, novaData);
    };

    const salvarCardapio = async (event) => {
        event.preventDefault();
        setSalvando(true);
        setError("");
        try {
            const semana = await salvarCardapioDia(dataSelecionada, formulario);
            const salvos = Object.fromEntries(mapearSemanaParaDias(semana).map(({ dia, refeicao }) => [dia, refeicao ?? cardapioVazio]));
            setCardapiosSalvos(salvos);
            setFormulario(salvos[dataSelecionada] ?? cardapioVazio);
            setFeedback(true);
        } catch (erro) {
            setError(erro?.message || "Não foi possível salvar o cardápio.");
        } finally {
            setSalvando(false);
        }
    };

    const copiarDoHistorico = (cardapio) => {
        setFormulario({
            pratoProteico: cardapio.pratoProteico,
            opcaoProteica: cardapio.opcaoProteica,
            acompanhamento1: cardapio.acompanhamento1,
            acompanhamento2: cardapio.acompanhamento2,
            guarnicao: cardapio.guarnicao,
            saladaDoDia: cardapio.saladaDoDia,
            sobremesa: cardapio.sobremesa,
            sucoNatural: cardapio.sucoNatural,
            valorCalorico: cardapio.valorCalorico,
        });
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Box className={styles.content}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {loading && <Alert severity="info">Carregando cardápio da semana...</Alert>}
                    <NavegacaoDias
                        dias={dias}
                        dataSelecionada={dataSelecionada}
                        intervalo={intervalo}
                        onSelectDay={selecionarDia}
                        onNavigateWeek={navegarSemana}
                        onBack={() => router.push("/painel-nutricionista-cardapio")}
                    />
                    <FormularioCardapio
                        dia={diaSelecionado.nome}
                        data={dataSelecionada}
                        valores={formulario}
                        onChange={(campo, valor) => setFormulario((atual) => ({ ...atual, [campo]: valor }))}
                        onSave={salvarCardapio}
                        onOpenHistory={() => setModalAberto(true)}
                        saving={salvando || loading}
                    />
                </Box>
            </Box>
            <ModalHistorico open={modalAberto} onClose={() => setModalAberto(false)} onSelect={copiarDoHistorico} />
            <Snackbar open={feedback} autoHideDuration={4000} onClose={() => setFeedback(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setFeedback(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
                    Cardápio de {diaSelecionado.nome} salvo com sucesso.
                </Alert>
            </Snackbar>
        </Box>
    );
}
