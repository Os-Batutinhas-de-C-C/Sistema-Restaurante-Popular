"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RegistrarDesperdicio from "../../components/painelNutricionista/RegistrarDesperdicio/RegistrarDesperdicio";
import DashboardNutricionista, {
    mockDadosDashboard,
} from "../../components/painelNutricionista/DashboardNutricionista/DashboardNutricionista";

/**
 * Página container do painel.
 *
 * Centraliza estado, callbacks e abertura do diálogo, mantendo os componentes
 * visuais reutilizáveis e independentes da camada de dados.
 */
export default function PainelNutricionistaPage() {
    const router = useRouter();
    // Estado local temporário até a integração com o backend.
    const [isWasteDialogOpen, setIsWasteDialogOpen] = useState(false);
    const [dadosDashboard, setDadosDashboard] = useState(mockDadosDashboard);

    return (
        <>
            {/* Dashboard recebe somente os dados e eventos necessários para renderizar. */}
            <DashboardNutricionista
                dadosDashboard={dadosDashboard}
                onWasteClick={() => setIsWasteDialogOpen(true)}
                onRefresh={() => router.refresh()}
            />
            {/* O diálogo é controlado pela página para manter o fluxo centralizado. */}
            <RegistrarDesperdicio
                open={isWasteDialogOpen}
                onClose={() => setIsWasteDialogOpen(false)}
                onSubmit={(value) =>
                    // Atualiza o mock local até que o salvamento seja feito pela API.
                    setDadosDashboard((current) => ({
                        ...current,
                        desperdicioKg: value,
                    }))
                }
            />
        </>
    );
}
