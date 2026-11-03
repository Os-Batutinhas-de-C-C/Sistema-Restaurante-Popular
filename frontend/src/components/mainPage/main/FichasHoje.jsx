"use client";

import { Alert, Button, CircularProgress, LinearProgress, Typography } from "@mui/material";
import useFichasDia from "@/services/useFichasDia";
import { diaUtilFichas, formatarAtualizacaoFichas, percentualFichas } from "@/services/fichasService";

export default function FichasHoje() {
    const fichas = useFichasDia();
    const dados = fichas.dados;
    const fimDeSemana = dados && !diaUtilFichas(dados.data);

    return (
        <div id="fichas" className="holders">
            <p className="tittle">FICHAS PRESENCIAIS</p>
            <p className="subText">Fichas Entregues Hoje</p>
            <p className="mainText" aria-live="polite" aria-atomic="true">
                <span data-testid="fichas-entregues">{dados?.entregues ?? "—"}</span>{" "}
                <span className="mainSub">/ <span data-testid="fichas-capacidade">{dados?.capacidade ?? "—"}</span></span>
            </p>
            <LinearProgress
                className="progress"
                variant="determinate"
                value={percentualFichas(dados)}
                aria-label="Capacidade diária de fichas entregues"
                sx={{ "& .MuiLinearProgress-bar": { backgroundColor: "#1D4ED8", borderRadius: "999px" } }}
            />
            <div id="progressText">
                <span className="paddingTextBlack">{dados ? `${dados.entregues} entregues` : "Aguardando dados"}</span>
                <span className="paddingTextLight">{dados ? `capacidade: ${dados.capacidade}` : ""}</span>
            </div>
            {dados && <Typography component="p" variant="caption">{fimDeSemana ? "Entregas de segunda a sexta-feira." : `Restam ${dados.restantes} fichas.`}</Typography>}
            {dados && <Typography component="p" variant="caption" color="text.secondary">{formatarAtualizacaoFichas(fichas.atualizadoEm)}</Typography>}
            {fichas.loading && <Typography component="p" variant="caption"><CircularProgress size={12} /> Carregando contagem...</Typography>}
            {fichas.error && (
                <>
                    <Alert severity="error" icon={false} sx={{ mt: 1, p: 1, fontSize: "0.75rem", overflowWrap: "anywhere" }}>{fichas.error}</Alert>
                    <Button size="small" onClick={fichas.recarregar}>Tentar novamente</Button>
                </>
            )}
        </div>
    );
}
