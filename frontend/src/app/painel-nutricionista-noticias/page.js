import PainelNutricionistaNoticias from "../../components/painelNutricionistaNoticias/PainelNutricionistaNoticias";
import ProtectedRoute from "../../components/login/ProtectedRoute";

export default function NoticiasPage() {
    return <ProtectedRoute allowedProfiles={["Nutricionista", "Gestor"]}><PainelNutricionistaNoticias /></ProtectedRoute>;
}
