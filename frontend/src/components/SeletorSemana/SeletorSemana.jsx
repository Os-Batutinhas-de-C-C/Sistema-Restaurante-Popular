"use client";

import { Box, Button, Stack } from "@mui/material";
import SeletorIntervaloDatas from "../SeletorIntervaloDatas/SeletorIntervaloDatas";
import styles from "./seletorSemana.module.css";

export default function SeletorSemana({ intervaloSelecionado, onSelectRange, onPreviousRange, onNextRange }) {
    const intervalo = intervaloSelecionado;

    return (
        <Stack className={styles.controls}>
            <SeletorIntervaloDatas value={intervalo} onChange={onSelectRange} />
            <Box className={styles.navigation}>
                <Button variant="contained" onClick={onPreviousRange} disabled={!intervalo?.from || !intervalo?.to} aria-label="Ver período anterior">‹ Anterior</Button>
                <Button variant="contained" onClick={onNextRange} disabled={!intervalo?.from || !intervalo?.to} aria-label="Ver próximo período">Próxima ›</Button>
            </Box>
        </Stack>
    );
}
