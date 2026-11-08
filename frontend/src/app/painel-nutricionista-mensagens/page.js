import PainelNutricionistaMensagens from "../../components/painelNutricionistaMensagens/PainelNutricionistaMensagens";
import ProtectedRoute from "../../components/login/ProtectedRoute";

export default function MensagensPage() {
    return <ProtectedRoute allowedProfiles={["Nutricionista", "Gestor", "Caixa"]}><PainelNutricionistaMensagens /></ProtectedRoute>;
}
