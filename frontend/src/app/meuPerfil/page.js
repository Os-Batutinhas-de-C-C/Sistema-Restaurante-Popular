"use client";

import MeuPerfil from "@/components/meuPerfil";
import ProtectedRoute from "@/components/login/ProtectedRoute";

export default function MeuPerfilPage() {
    return <ProtectedRoute><MeuPerfil /></ProtectedRoute>;
}
