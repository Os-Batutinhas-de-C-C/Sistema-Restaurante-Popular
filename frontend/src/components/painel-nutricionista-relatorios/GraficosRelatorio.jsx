import GraficosCardapio from "../painelNutricionistaCardapio/GraficosCardapio/GraficosCardapio";

export default function GraficosRelatorio({ dados }) {
    return <GraficosCardapio graficos={dados} cartaoCombinado />;
}
