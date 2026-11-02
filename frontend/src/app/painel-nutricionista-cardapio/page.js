import PainelNutricionistaCardapio from "../../components/painelNutricionistaCardapio/PainelNutricionistaCardapio";
import ProtectedRoute from "../../components/login/ProtectedRoute";

export default function PainelNutricionistaCardapioPage() {
    return <ProtectedRoute><PainelNutricionistaCardapio /></ProtectedRoute>;
}
