"use client";

import Add from "@mui/icons-material/Add";
import Refresh from "@mui/icons-material/Refresh";
import { Alert, Button, Card, CardContent, CircularProgress, LinearProgress, Snackbar } from "@mui/material";
import useFichasDia from "@/services/useFichasDia";
import { diaUtilFichas, formatarAtualizacaoFichas, formatarDataFichas, percentualFichas } from "@/services/fichasService";
import styles from "./style.module.css";

const ConteudoDoPainel = () => {
  const fichas = useFichasDia();
  const dados = fichas.dados;
  const fimDeSemana = dados && !diaUtilFichas(dados.data);
  const limiteAtingido = dados && dados.entregues >= dados.capacidade;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Contagem de Fichas</h1>
            <p className={styles.date}>{formatarDataFichas(dados?.data ?? fichas.dataReferencia)}</p>
          </div>
          <Button
            variant="outlined"
            size="small"
            className={styles.refreshButton}
            startIcon={<Refresh className={styles.refreshIcon} />}
            onClick={fichas.recarregar}
            disabled={fichas.loading || fichas.adicionando}
            aria-label="Atualizar contagem de fichas"
          >
            {formatarAtualizacaoFichas(fichas.atualizadoEm)}
          </Button>
        </header>

        {fichas.loading && <Alert severity="info">Carregando contagem de fichas...</Alert>}
        {fichas.error && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={fichas.recarregar}>Tentar novamente</Button>}>
            {fichas.error}
          </Alert>
        )}
        {fichas.erroRegistro && <Alert severity="error">{fichas.erroRegistro}</Alert>}
        {fimDeSemana && <Alert severity="info">A entrega de fichas funciona de segunda a sexta-feira.</Alert>}
        {!fimDeSemana && limiteAtingido && <Alert severity="warning">Limite de {dados.capacidade} fichas atingido hoje.</Alert>}

        <div className={styles.row}>
          <Card component="section" variant="outlined" className={styles.card}>
            <CardContent className={styles.cardContent}>
              <div className={styles.cardBody}>
                <h2 className={styles.label}>FICHAS ENTREGUES</h2>

                <div className={styles.valueRow} aria-live="polite" aria-atomic="true">
                  <span className={styles.value} data-testid="fichas-entregues">{dados?.entregues ?? "—"}</span>
                  <span className={styles.total}>/ <span data-testid="fichas-capacidade">{dados?.capacidade ?? "—"}</span></span>
                </div>

                <div className={styles.progressBlock}>
                  <div className={styles.progressLabels}>
                    <span className={styles.capacity}>
                      {dados ? `${Math.round(percentualFichas(dados))}% da capacidade diária` : "Contagem indisponível"}
                    </span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={percentualFichas(dados)}
                    aria-label="Capacidade diária de fichas entregues"
                    className={styles.progress}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <section className={styles.actionBox}>
            <Button
              fullWidth
              variant="contained"
              className={styles.addButton}
              startIcon={fichas.adicionando ? <CircularProgress size={22} color="inherit" /> : <Add className={styles.addIcon} />}
              onClick={fichas.adicionar}
              disabled={fichas.loading || fichas.adicionando || !dados?.permiteAdicionar}
            >
              {fichas.adicionando ? "REGISTRANDO FICHA..." : "ADICIONAR MAIS UMA FICHA"}
            </Button>
          </section>
        </div>
      </div>
      <Snackbar open={Boolean(fichas.sucesso)} autoHideDuration={4000} onClose={fichas.limparSucesso}>
        <Alert severity="success" variant="filled" onClose={fichas.limparSucesso}>{fichas.sucesso}</Alert>
      </Snackbar>
    </main>
  );
};

export default ConteudoDoPainel;
