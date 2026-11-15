"use client";

import { Box, Paper } from "@mui/material";
import SeletorIntervaloDatas from "../SeletorIntervaloDatas/SeletorIntervaloDatas";

export default function FiltroPeriodoPainel({ value, onChange, label, children }) {
    return (
        <Paper
            component="section"
            variant="outlined"
            aria-label={label}
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                minHeight: 84,
                px: { xs: 2, sm: 3 },
                py: 2,
                borderColor: "#e4e8eb",
                borderRadius: 2,
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
            }}
        >
            <Box sx={{ display: "flex", width: "100%", maxWidth: { sm: 320 } }}>
                <SeletorIntervaloDatas
                    value={value}
                    onChange={onChange}
                    label="Selecione o Período"
                    ariaLabel="Abrir seletor de período"
                />
            </Box>
            {children}
        </Paper>
    );
}
