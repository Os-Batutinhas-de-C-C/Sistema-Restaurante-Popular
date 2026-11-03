import PainelNutricionistaEstoque from "../../components/painelNutricionistaEstoque/PainelNutricionistaEstoque";
import ProtectedRoute from "../../components/login/ProtectedRoute";

export default function EstoquePage() {
    return <ProtectedRoute allowedProfiles={["Nutricionista", "Gestor"]}><PainelNutricionistaEstoque /></ProtectedRoute>;
}
