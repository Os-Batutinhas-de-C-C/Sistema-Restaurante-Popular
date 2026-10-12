"use client";

import Add from "@mui/icons-material/Add";
import Refresh from "@mui/icons-material/Refresh";
import { Button, Card, CardContent, LinearProgress } from "@mui/material";
import styles from "./style.module.css";

const consumption = {
  consumed: "150",
  total: "300",
  percentage: 50,
  capacityLabel: "50% da capacidade diária",
  remainingLabel: "Restam 150",
};

const ContedoDoPainel = () => {
  const handleAddToken = () => {};

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Contagem de Fichas</h1>
            <p className={styles.date}>Quarta-Feira, 23 de Setembro</p>
          </div>
          <Button
            variant="outlined"
            size="small"
            className={styles.refreshButton}
            startIcon={<Refresh className={styles.refreshIcon} />}
          >
            Atualizado às 11:42
          </Button>
        </header>

        <div className={styles.row}>
          <Card component="section" variant="outlined" className={styles.card}>
            <CardContent className={styles.cardContent}>
              <div className={styles.cardBody}>
                <h2 className={styles.label}>FICHAS CONSUMIDAS</h2>

                <div className={styles.valueRow}>
                  <span className={styles.value}>{consumption.consumed}</span>
                  <span className={styles.total}>/ {consumption.total}</span>
                </div>

                <div className={styles.progressBlock}>
                  <div className={styles.progressLabels}>
                    <span className={styles.capacity}>
                      {consumption.capacityLabel}
                    </span>
                    <span className={styles.remaining}>
                      {consumption.remainingLabel}
                    </span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={consumption.percentage}
                    aria-label="Capacidade diária consumida"
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
              startIcon={<Add className={styles.addIcon} />}
              onClick={handleAddToken}
            >
              ADICIONAR MAIS UMA FICHA
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ContedoDoPainel;