"use client";

import { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import styles from "./painelNutricionistaRelatorios.module.css";

export default function DialogRelatorio({ relatorio, onClose, onSave }) {
    const [fichasVendidas, setFichasVendidas] = useState(
        relatorio?.fichas == null ? "" : String(relatorio.fichas),
    );
    const [desperdicioKg, setDesperdicioKg] = useState(
        relatorio?.desperdicioKg == null ? "" : String(relatorio.desperdicioKg),
    );
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    const salvar = async () => {
        setSalvando(true);
        try {
            await onSave(relatorio.id, { fichasVendidas, desperdicioKg });
            onClose();
        } catch (erroValidacao) {
            setErro(erroValidacao.message);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog
            open={Boolean(relatorio)}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="editar-relatorio-titulo"
        >
            <DialogTitle component="div">
                <Stack spacing={0.5}>
                    <Typography
                        id="editar-relatorio-titulo"
                        component="h2"
                        variant="subtitle1"
                        sx={{ fontWeight: 700 }}
                    >
                        Editar relatório do dia
                    </Typography>
                    <Typography variant="body2">
                        Atualize as fichas e o desperdício deste dia.
                    </Typography>
                </Stack>
            </DialogTitle>
            <DialogContent className={styles.dialogContent}>
                <Paper variant="outlined" className={styles.dayDetails}>
                    <Typography variant="subtitle2">Dados do dia</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {relatorio
                            ? `${relatorio.dia} · ${relatorio.dataFormatada}`
                            : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {relatorio?.refeicao}
                    </Typography>
                </Paper>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                        label="Fichas"
                        type="number"
                        value={fichasVendidas}
                        onChange={(event) => setFichasVendidas(event.target.value)}
                        slotProps={{ htmlInput: { min: 0, max: 300, step: 1 } }}
                        fullWidth
                    />
                    <TextField
                        label="Desperdício (kg)"
                        type="number"
                        value={desperdicioKg}
                        onChange={(event) => setDesperdicioKg(event.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                        fullWidth
                    />
                </Stack>
                {erro && (
                    <Typography role="alert" color="error" variant="body2">
                        {erro}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={salvando}>Cancelar</Button>
                <Button variant="contained" onClick={salvar} disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar alterações"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
