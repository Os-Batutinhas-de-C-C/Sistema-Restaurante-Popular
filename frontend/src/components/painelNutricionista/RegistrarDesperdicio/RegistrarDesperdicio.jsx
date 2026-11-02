"use client";

import { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import styles from "./registrarDesperdicio.module.css";

/**
 * Dialog para registrar o desperdício do dia.
 *
 * O componente controla apenas o formulário. A persistência e a atualização
 * do dashboard ficam sob responsabilidade da página pai via callbacks.
 */
export default function RegistrarDesperdicio({
    open,
    onClose,
    onSubmit,
}) {
    // Estado local evita acoplamento do formulário ao estado do dashboard.
    const [waste, setWaste] = useState("");
    const [error, setError] = useState("");

    // Aceita vírgula decimal e impede o envio de valores inválidos ou negativos.
    const handleSubmit = () => {
        const value = Number(waste.replace(",", "."));

        if (!waste || Number.isNaN(value) || value < 0) {
            setError("Informe um peso válido em kg.");
            return;
        }

        onSubmit?.(value);
        setWaste("");
        setError("");
        onClose();
    };

    // Limpa o formulário tanto no cancelamento quanto no fechamento externo.
    const handleClose = () => {
        setWaste("");
        setError("");
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    className: styles.paper,
                },
            }}
        >
            <DialogTitle component="div" className={styles.title}>
                <Typography variant="h6" className={styles.heading}>
                    Registrar Desperdício do Dia
                </Typography>
                <Typography
                    variant="body2"
                    className={styles.description}
                >
                    Informe o peso das Desperdício de hoje.
                </Typography>
            </DialogTitle>

            <DialogContent className={styles.content}>
                <Stack spacing={3}>
                    <Box
                        className={styles.dayData}
                    >
                        <Typography
                            variant="subtitle2"
                            className={styles.dayTitle}
                        >
                            Dados do dia
                        </Typography>
                        <Typography
                            variant="body1"
                            className={styles.dayValue}
                        >
                            Hoje • Quarta-feira, 23/09/2026
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        label="Desperdício (kg)"
                        type="number"
                        value={waste}
                        onChange={(event) => {
                            setWaste(event.target.value);
                            if (error) {
                                setError("");
                            }
                        }}
                        error={Boolean(error)}
                        helperText={
                            error ||
                            "Informe o peso em kg. Aceita decimais (ex.: 2,5)."
                        }
                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                        className={styles.field}
                    />
                </Stack>
            </DialogContent>

            <DialogActions
                className={styles.actions}
            >
                <Button
                    onClick={handleClose}
                    className={styles.cancel}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    className={styles.submit}
                >
                    Registrar Desperdício
                </Button>
            </DialogActions>
        </Dialog>
    );
}
