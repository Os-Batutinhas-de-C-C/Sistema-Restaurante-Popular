import GraficosCardapio from "../painelNutricionistaCardapio/GraficosCardapio/GraficosCardapio";
import styles from "./painelNutricionistaRelatorios.module.css";

export default function GraficosRelatorio({ dados }) {
    return <GraficosCardapio graficos={dados} className={styles.charts} />;
}
