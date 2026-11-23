import ProtectedRoute from "@/components/login/ProtectedRoute";
import PainelOperacional from "@/components/painelCompartilhado/PainelOperacional";

export default function PainelNutricionistaPage() {
    return (
        <ProtectedRoute allowedProfiles={["Nutricionista"]}>
            <PainelOperacional titulo="Painel da Nutricionista" />
        </ProtectedRoute>
    );
}
