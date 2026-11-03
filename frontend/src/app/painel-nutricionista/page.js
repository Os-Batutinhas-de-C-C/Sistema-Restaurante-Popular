"use client";

import { useEffect, useMemo, useState } from "react";
import RegistrarDesperdicio from "../../components/PainelNutricionista/RegistrarDesperdicio/RegistrarDesperdicio";
import DashboardNutricionista from "../../components/PainelNutricionista/DashboardNutricionista/DashboardNutricionista";
import ProtectedRoute from "../../components/login/ProtectedRoute";
import {
    dataIsoLocal,
    listarSemanasApi,
    mapearRefeicao,
    obterSegundaIso,
    salvarDesperdicioDiaApi,
} from "../../services/cardapiosApiService";

function montarDadosDashboard(semana, agora = new Date()) {
    const dataIso = dataIsoLocal(agora);
    const diaDaSemana = agora.getDay();
    const indiceDia = diaDaSemana >= 1 && diaDaSemana <= 5 ? diaDaSemana - 1 : -1;
    const refeicao = indiceDia >= 0 ? semana?.cardapio?.[indiceDia] : null;
    const formatadorData = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const desperdicio = indiceDia >= 0 ? semana?.desperdicio?.[indiceDia] : null;
    const fichas = indiceDia >= 0 ? semana?.fichasVendidas?.[indiceDia] : null;

    return {
        titulo: "Painel da Nutricionista",
        data: formatadorData.format(agora),
        dataIso,
        atualizadoEm: `Atualizado às ${new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(agora)}`,
        fichasConsumidas: fichas == null ? null : Number(fichas),
        fichasTotais: null,
        desperdicioKg: desperdicio == null ? null : Number(desperdicio),
        cardapio: mapearRefeicao(refeicao),
        permiteRegistrarDesperdicio: indiceDia >= 0,
    };
}

export default function PainelNutricionistaPage() {
    const agora = useMemo(() => new Date(), []);
    const dataIso = dataIsoLocal(agora);
    const dataSegunda = obterSegundaIso(agora);
    const [isWasteDialogOpen, setIsWasteDialogOpen] = useState(false);
    const [dadosDashboard, setDadosDashboard] = useState(() => montarDadosDashboard(null, agora));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let ativo = true;
        listarSemanasApi()
            .then((semanas) => {
                if (!ativo) return;
                const semanaAtual = semanas.find((semana) => semana.data === dataSegunda) ?? null;
                setDadosDashboard(montarDadosDashboard(semanaAtual, agora));
                setError("");
            })
            .catch((erro) => {
                if (ativo) setError(erro?.message || "Não foi possível carregar os dados do painel.");
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });
        return () => { ativo = false; };
    }, [agora, dataSegunda, refreshKey]);

    const recarregar = () => {
        setLoading(true);
        setError("");
        setRefreshKey((atual) => atual + 1);
    };

    const registrarDesperdicio = async (value) => {
        const semanaAtualizada = await salvarDesperdicioDiaApi(dataIso, value);
        setDadosDashboard(montarDadosDashboard(semanaAtualizada, agora));
        setError("");
    };

    return (
        <ProtectedRoute allowedProfiles={["Nutricionista", "Gestor"]}>
            <DashboardNutricionista
                dadosDashboard={dadosDashboard}
                onWasteClick={() => setIsWasteDialogOpen(true)}
                onRefresh={recarregar}
                loading={loading}
                error={error}
            />
            <RegistrarDesperdicio
                open={isWasteDialogOpen}
                dataIso={dataIso}
                disabled={!dadosDashboard.permiteRegistrarDesperdicio}
                onClose={() => setIsWasteDialogOpen(false)}
                onSubmit={registrarDesperdicio}
            />
        </ProtectedRoute>
    );
}
