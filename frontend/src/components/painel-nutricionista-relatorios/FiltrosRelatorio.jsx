"use client";

import { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import {
    Button,
    Divider,
    Menu,
    MenuItem,
    Paper,
    Stack,
} from "@mui/material";
import SeletorIntervaloDatas from "../SeletorIntervaloDatas/SeletorIntervaloDatas";
import styles from "./painelNutricionistaRelatorios.module.css";

export default function FiltrosRelatorio({ periodo, onPeriodoChange, onExport }) {
    const [menuAnchor, setMenuAnchor] = useState(null);

    const selecionarFormato = (formato) => {
        setMenuAnchor(null);
        onExport(formato);
    };

    return (
        <Paper
            component="section"
            aria-label="Filtros do relatório"
            variant="outlined"
            className={styles.filterCard}
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                className={styles.filters}
            >
                <SeletorIntervaloDatas
                    value={periodo}
                    onChange={onPeriodoChange}
                    label="Selecione o Período"
                    exibirIconeCalendario={false}
                    selecionarSemana
                />
                <Button
                    variant="contained"
                    color="success"
                    endIcon={<DownloadIcon />}
                    aria-haspopup="menu"
                    aria-expanded={Boolean(menuAnchor)}
                    aria-controls={menuAnchor ? "menu-exportar-relatorio" : undefined}
                    onClick={(event) => setMenuAnchor(event.currentTarget)}
                    className={styles.exportButton}
                >
                    Exportar
                </Button>
            </Stack>
            <Menu
                id="menu-exportar-relatorio"
                aria-label="Opções de exportação"
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem onClick={() => selecionarFormato("pdf")}>PDF</MenuItem>
                <Divider component="li" />
                <MenuItem onClick={() => selecionarFormato("csv")}>CSV</MenuItem>
            </Menu>
        </Paper>
    );
}
