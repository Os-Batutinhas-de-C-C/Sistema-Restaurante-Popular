import ProtectedRoute from "@/components/login/ProtectedRoute";

export default function OficinasGestorLayout({ children }) {
    return <ProtectedRoute allowedProfiles={["Gestor"]}>{children}</ProtectedRoute>;
}
