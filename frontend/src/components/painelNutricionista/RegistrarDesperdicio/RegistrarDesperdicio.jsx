"use client";

import { useState } from "react";
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Stack, TextField, Typography,
} from "@mui/material";
import styles from "./registrarDesperdicio.module.css";

function formatarData(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
    }).format(new Date(year, month - 1, day));
}

export default function RegistrarDesperdicio({ open, onClose, onSubmit, dataIso, disabled = false }) {
    const [waste, setWaste] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const value = Number(waste.trim().replace(",", "."));
        if (!waste.trim() || !Number.isFinite(value) || value < 0) {
            setError("Informe um peso válido em kg.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await onSubmit?.(value);
            setWaste("");
            setError("");
            onClose();
        } catch (submitError) {
            setError(submitError?.message || "Não foi possível registrar o desperdício. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            setWaste("");
            setError("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" slotProps={{ paper: { className: styles.paper } }}>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogTitle component="div" className={styles.title}>
                    <Typography variant="h6" className={styles.heading}>Registrar Desperdício do Dia</Typography>
                    <Typography variant="body2" className={styles.description}>Informe o peso do desperdício registrado para hoje.</Typography>
                </DialogTitle>
                <DialogContent className={styles.content}>
                    <Stack spacing={3}>
                        <Box className={styles.dayData}>
                            <Typography variant="subtitle2" className={styles.dayTitle}>Dados do dia</Typography>
                            <Typography variant="body1" className={styles.dayValue}>{formatarData(dataIso)}</Typography>
                        </Box>
                        {disabled && <Alert severity="info">O registro de desperdício está disponível de segunda a sexta-feira.</Alert>}
                        <TextField
                            fullWidth
                            label="Desperdício (kg)"
                            type="text"
                            value={waste}
                            onChange={(event) => {
                                setWaste(event.target.value);
                                if (error) setError("");
                            }}
                            error={Boolean(error)}
                            helperText={error || "Informe o peso em kg. Aceita decimais (ex.: 2,5)."}
                            slotProps={{ htmlInput: { inputMode: "decimal" } }}
                            className={styles.field}
                            disabled={disabled || saving}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions className={styles.actions}>
                    <Button onClick={handleClose} disabled={saving} className={styles.cancel}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={disabled || saving} className={styles.submit}>
                        {saving ? "Salvando..." : "Registrar Desperdício"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
