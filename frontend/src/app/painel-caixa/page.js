"use client";

import ConteudoDoPainel from "@/components/painelCaixa";
import ProtectedRoute from "@/components/login/ProtectedRoute";

export default function PainelCaixaPage() {
    return <ProtectedRoute allowedProfiles={["Caixa"]}><ConteudoDoPainel /></ProtectedRoute>;
}
