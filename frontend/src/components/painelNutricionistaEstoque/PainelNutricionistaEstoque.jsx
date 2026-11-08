"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Skeleton, Snackbar, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import BarraAcoesEstoque from "./BarraAcoesEstoque/BarraAcoesEstoque";
import DialogConfirmarExclusao from "./DialogConfirmarExclusao/DialogConfirmarExclusao";
import DialogInsumo from "./DialogInsumo/DialogInsumo";
import ListaEstoque from "./ListaEstoque/ListaEstoque";
import {
    atualizarItemEstoque,
    criarItemEstoque,
    listarEstoque,
    removerItemEstoque,
} from "../../services/estoqueService";
import styles from "./painelNutricionistaEstoque.module.css";

export default function PainelNutricionistaEstoque() {
    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pesquisa, setPesquisa] = useState("");
    const [itemEditando, setItemEditando] = useState(null);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [feedbackSeverity, setFeedbackSeverity] = useState("success");

    const carregarEstoque = useCallback(async () => {
        try {
            setItens(await listarEstoque());
        } catch (erro) {
            setError(erro?.message || "Não foi possível carregar o estoque.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let ativo = true;
        listarEstoque()
            .then((resultado) => { if (ativo) setItens(resultado); })
            .catch((erro) => { if (ativo) setError(erro?.message || "Não foi possível carregar o estoque."); })
            .finally(() => { if (ativo) setLoading(false); });
        return () => { ativo = false; };
    }, [carregarEstoque]);

    const recarregarEstoque = () => {
        setLoading(true);
        setError("");
        return carregarEstoque();
    };

    const itensFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");
        return itens.filter((item) => item.nome.toLocaleLowerCase("pt-BR").includes(termo));
    }, [itens, pesquisa]);

    const abrirCadastro = () => {
        setItemEditando(null);
        setDialogAberto(true);
    };

    const salvarInsumo = async (valores) => {
        try {
            if (itemEditando) {
                await atualizarItemEstoque(itemEditando.id, valores);
            } else {
                await criarItemEstoque(valores);
            }
            await recarregarEstoque();
            setFeedbackSeverity("success");
            setFeedback(itemEditando ? "Insumo atualizado com sucesso." : "Insumo adicionado com sucesso.");
            setDialogAberto(false);
            setItemEditando(null);
        } catch (erro) {
            setFeedbackSeverity("error");
            setFeedback(erro?.message || "Não foi possível salvar o insumo.");
        }
    };

    const confirmarExclusao = async () => {
        if (!itemParaExcluir) return;
        try {
            await removerItemEstoque(itemParaExcluir.id);
            await recarregarEstoque();
            setFeedbackSeverity("success");
            setFeedback("Insumo excluído do estoque.");
            setItemParaExcluir(null);
        } catch (erro) {
            setFeedbackSeverity("error");
            setFeedback(erro?.message || "Não foi possível excluir o insumo.");
        }
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Stack className={styles.content}>
                    <Typography component="h1" variant="h5" className={styles.title}>Estoque de Alimentos</Typography>
                    <BarraAcoesEstoque pesquisa={pesquisa} onSearch={setPesquisa} onAdd={abrirCadastro} />
                    {loading ? (
                        <Stack spacing={1}>
                            <Skeleton variant="rounded" height={56} />
                            <Skeleton variant="rounded" height={72} />
                            <Skeleton variant="rounded" height={72} />
                        </Stack>
                    ) : error ? (
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={recarregarEstoque}>Tentar novamente</Button>}>
                            {error}
                        </Alert>
                    ) : (
                        <ListaEstoque
                            itens={itensFiltrados}
                            onEdit={(item) => { setItemEditando(item); setDialogAberto(true); }}
                            onDelete={setItemParaExcluir}
                        />
                    )}
                </Stack>
            </Box>
            <DialogInsumo key={dialogAberto ? (itemEditando?.id ?? "novo") : "fechado"} open={dialogAberto} item={itemEditando} onClose={() => setDialogAberto(false)} onSave={salvarInsumo} />
            <DialogConfirmarExclusao item={itemParaExcluir} onClose={() => setItemParaExcluir(null)} onConfirm={confirmarExclusao} />
            <Snackbar open={Boolean(feedback)} autoHideDuration={4000} onClose={() => setFeedback("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setFeedback("")} severity={feedbackSeverity} variant="filled">{feedback}</Alert>
            </Snackbar>
        </Box>
    );
}
