"use client";

import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import FiltroPeriodoPainel from "../../painelCompartilhado/FiltroPeriodoPainel";

export default function BarraNoticias({ periodo, onPeriodoChange, onPublicar }) {
    return (
        <FiltroPeriodoPainel
            value={periodo}
            onChange={onPeriodoChange}
            label="Filtros de notícias e avisos"
        >
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onPublicar}
                sx={{
                    minWidth: { xs: "100%", sm: 168 },
                    minHeight: 40,
                    borderRadius: 1,
                    bgcolor: "#008fd3",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.18)",
                    fontSize: 12,
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#007fbc" },
                }}
            >
                Publicar notícia
            </Button>
        </FiltroPeriodoPainel>
    );
}
