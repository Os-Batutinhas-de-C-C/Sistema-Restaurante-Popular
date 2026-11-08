"use client";

import ConteudoDoPainel from "@/components/painelCaixa";
import ProtectedRoute from "@/components/login/ProtectedRoute";
import NavbarPainel from "@/components/NavbarPainel/NavbarPainel";

export default function PainelCaixaPage() {
    return (
        <ProtectedRoute allowedProfiles={["Caixa"]}>
            <NavbarPainel variant="caixa" />
            <ConteudoDoPainel />
        </ProtectedRoute>
    );
}
