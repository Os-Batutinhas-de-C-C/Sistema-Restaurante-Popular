"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Chip,
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
    const [fichas, setFichas] = useState("");
    const [desperdicioKg, setDesperdicioKg] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        setFichas(relatorio?.fichas == null ? "" : String(relatorio.fichas));
        setDesperdicioKg(
            relatorio?.desperdicioKg == null ? "" : String(relatorio.desperdicioKg),
        );
        setErro("");
    }, [relatorio]);

    const salvar = () => {
        try {
            onSave(relatorio.id, { fichas, desperdicioKg });
            onClose();
        } catch (erroValidacao) {
            setErro(erroValidacao.message);
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
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="subtitle2">Dados do dia</Typography>
                        <Chip
                            label="Somente leitura"
                            size="small"
                            variant="outlined"
                        />
                    </Stack>
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
                        value={fichas}
                        onChange={(event) => setFichas(event.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
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
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={salvar}>
                    Salvar alterações
                </Button>
            </DialogActions>
        </Dialog>
    );
}
