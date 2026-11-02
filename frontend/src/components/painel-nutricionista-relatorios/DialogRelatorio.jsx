"use client";

import { useEffect, useState } from "react";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from "@mui/material";
import styles from "./painelNutricionistaRelatorios.module.css";

function valorValido(valor) {
    const normalizado = String(valor).trim().replace(",", ".");
    return /^\d+(\.\d)?$/.test(normalizado) && Number.isFinite(Number(normalizado)) && Number(normalizado) >= 0;
}

function fichasValidas(valor) {
    const texto = String(valor).trim();
    return /^\d+$/.test(texto) && Number.isSafeInteger(Number(texto)) && Number(texto) >= 0;
}

export default function DialogRelatorio({ relatorio, onClose, onSave }) {
    const [fichas, setFichas] = useState("");
    const [desperdicioKg, setDesperdicioKg] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        setFichas(relatorio?.fichas == null ? "" : String(relatorio.fichas));
        setDesperdicioKg(relatorio?.desperdicioKg == null ? "" : String(relatorio.desperdicioKg));
        setErro("");
    }, [relatorio]);

    const salvar = () => {
        if (!fichasValidas(fichas) || !valorValido(desperdicioKg)) return;
        try {
            onSave(relatorio.id, { fichas, desperdicioKg });
            onClose();
        } catch (falha) {
            setErro(falha.message || "Não foi possível salvar o relatório.");
        }
    };

    return (
        <Dialog open={Boolean(relatorio)} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="editar-relatorio-titulo">
            <DialogTitle id="editar-relatorio-titulo" component="h2" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
                Editar relatório do dia
                <Typography component="span" display="block" variant="body2" sx={{ mt: 0.5, fontWeight: 400 }}>Atualize as fichas e o desperdício deste dia.</Typography>
            </DialogTitle>
            <DialogContent className={styles.dialogContent}>
                <Paper variant="outlined" className={styles.dayDetails}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="subtitle2" fontWeight={700}>Dados do dia</Typography><Chip label="Somente leitura" size="small" variant="outlined" /></Stack>
                    <Stack spacing={0.5}><Typography variant="caption" color="text.secondary">Dia</Typography><Typography variant="body2">{relatorio ? `${relatorio.dia} · ${relatorio.dataFormatada}` : ""}</Typography></Stack>
                    <Stack spacing={0.5}><Typography variant="caption" color="text.secondary">Descrição Cardápio</Typography><Typography variant="body2">{relatorio?.refeicao}</Typography></Stack>
                </Paper>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField label="Fichas" type="text" value={fichas} onChange={(event) => setFichas(event.target.value)} fullWidth slotProps={{ htmlInput: { inputMode: "numeric", "aria-label": "Quantidade de fichas" } }} />
                    <TextField autoFocus label="Desperdício (kg)" type="text" value={desperdicioKg} onChange={(event) => setDesperdicioKg(event.target.value)} fullWidth slotProps={{ htmlInput: { inputMode: "decimal", "aria-label": "Desperdício em quilogramas" } }} />
                </Stack>
                {erro && <Typography role="alert" color="error" variant="body2">{erro}</Typography>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>CANCELAR</Button>
                <Button variant="contained" onClick={salvar} disabled={!fichasValidas(fichas) || !valorValido(desperdicioKg)}>SALVAR ALTERAÇÕES</Button>
            </DialogActions>
        </Dialog>
    );
}
