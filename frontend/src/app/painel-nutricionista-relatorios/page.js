import PainelNutricionistaRelatorios from "../../components/painel-nutricionista-relatorios/PainelNutricionistaRelatorios";
import ProtectedRoute from "../../components/login/ProtectedRoute";

export default function RelatorioPage() {
    return (
        <ProtectedRoute allowedProfiles={["Nutricionista", "Gestor"]}>
            <PainelNutricionistaRelatorios />
        </ProtectedRoute>
    );
}
