"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import BarraAcoesEstoque from "./BarraAcoesEstoque/BarraAcoesEstoque";
import DialogConfirmarExclusao from "./DialogConfirmarExclusao/DialogConfirmarExclusao";
import DialogInsumo from "./DialogInsumo/DialogInsumo";
import ListaEstoque from "./ListaEstoque/ListaEstoque";
import { estoqueMockData } from "../../services/estoqueService";
import styles from "./painelNutricionistaEstoque.module.css";

export default function PainelNutricionistaEstoque() {
    const [itens, setItens] = useState(estoqueMockData);
    const [pesquisa, setPesquisa] = useState("");
    const [itemEditando, setItemEditando] = useState(null);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [feedback, setFeedback] = useState("");

    const itensFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");
        return itens.filter((item) => item.nome.toLocaleLowerCase("pt-BR").includes(termo));
    }, [itens, pesquisa]);

    const abrirCadastro = () => {
        setItemEditando(null);
        setDialogAberto(true);
    };

    const salvarInsumo = (valores) => {
        if (itemEditando) {
            setItens((atuais) => atuais.map((item) => item.id === itemEditando.id ? { ...valores, id: item.id } : item));
            setFeedback("Insumo atualizado com sucesso.");
        } else {
            const novoItem = { ...valores, id: `${valores.lote}-${Date.now()}` };
            setItens((atuais) => [novoItem, ...atuais]);
            setFeedback("Insumo adicionado com sucesso.");
        }
        setDialogAberto(false);
        setItemEditando(null);
    };

    const confirmarExclusao = () => {
        setItens((atuais) => atuais.filter((item) => item.id !== itemParaExcluir.id));
        setFeedback("Insumo excluído do estoque.");
        setItemParaExcluir(null);
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Stack className={styles.content}>
                    <Typography component="h1" variant="h5" className={styles.title}>Estoque de Alimentos</Typography>
                    <BarraAcoesEstoque pesquisa={pesquisa} onSearch={setPesquisa} onAdd={abrirCadastro} />
                    <ListaEstoque
                        itens={itensFiltrados}
                        onEdit={(item) => { setItemEditando(item); setDialogAberto(true); }}
                        onDelete={setItemParaExcluir}
                    />
                </Stack>
            </Box>
            <DialogInsumo key={dialogAberto ? (itemEditando?.id ?? "novo") : "fechado"} open={dialogAberto} item={itemEditando} onClose={() => setDialogAberto(false)} onSave={salvarInsumo} />
            <DialogConfirmarExclusao item={itemParaExcluir} onClose={() => setItemParaExcluir(null)} onConfirm={confirmarExclusao} />
            <Snackbar open={Boolean(feedback)} autoHideDuration={4000} onClose={() => setFeedback("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setFeedback("")} severity="success" variant="filled">{feedback}</Alert>
            </Snackbar>
        </Box>
    );
}
