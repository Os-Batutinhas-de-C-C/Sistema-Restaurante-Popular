import ProtectedRoute from "@/components/login/ProtectedRoute";
import PainelGestor from "@/components/PainelGestor/PainelGestor";

export default function PainelGestorPage() {
    return (
        <ProtectedRoute allowedProfiles={["Gestor"]}>
            <PainelGestor />
        </ProtectedRoute>
    );
}
