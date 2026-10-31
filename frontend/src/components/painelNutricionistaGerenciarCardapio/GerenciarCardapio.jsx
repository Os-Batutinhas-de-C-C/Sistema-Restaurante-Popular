"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Snackbar } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import FormularioCardapio from "./FormularioCardapio/FormularioCardapio";
import ModalHistorico from "./ModalHistorico/ModalHistorico";
import NavegacaoDias from "./NavegacaoDias/NavegacaoDias";
import {
    cardapioVazio, dataDeIsoLocal, dataIsoLocal, formatarIntervaloSemana,
    obterDiasUteisDaSemana,
} from "../../services/gerenciamentoCardapioService";
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
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState(false);

    const diaSelecionado = dias.find(({ data }) => data === dataSelecionada) ?? dias[0];
    const intervalo = useMemo(() => formatarIntervaloSemana(dias), [dias]);

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
        setFormulario(cardapiosSalvos[novaData] ?? cardapioVazio);
    };

    const salvarCardapio = (event) => {
        event.preventDefault();
        setSalvando(true);
        window.setTimeout(() => {
            setCardapiosSalvos((atuais) => ({ ...atuais, [dataSelecionada]: { ...formulario } }));
            setSalvando(false);
            setFeedback(true);
        }, 400);
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
                        saving={salvando}
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
