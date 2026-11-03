"use client";

import { useEffect, useState } from "react";
import RegistrarDesperdicio from "../../components/PainelNutricionista/RegistrarDesperdicio/RegistrarDesperdicio";
import DashboardNutricionista from "../../components/PainelNutricionista/DashboardNutricionista/DashboardNutricionista";
import ProtectedRoute from "../../components/login/ProtectedRoute";
import useFichasDia from "../../services/useFichasDia";
import {
    dataIsoFortaleza,
    diaUtilFichas,
    formatarAtualizacaoFichas,
    formatarDataFichas,
} from "../../services/fichasService";
import {
    dataDeIsoLocal,
    listarSemanasApi,
    mapearRefeicao,
    obterSegundaIso,
    salvarDesperdicioDiaApi,
} from "../../services/cardapiosApiService";

function montarDadosDashboard(semana, dataIso) {
    const diaDaSemana = new Date(`${dataIso}T12:00:00Z`).getUTCDay();
    const indiceDia = diaDaSemana >= 1 && diaDaSemana <= 5 ? diaDaSemana - 1 : -1;
    const refeicao = indiceDia >= 0 ? semana?.cardapio?.[indiceDia] : null;
    const desperdicio = indiceDia >= 0 ? semana?.desperdicio?.[indiceDia] : null;

    return {
        titulo: "Painel da Nutricionista",
        data: formatarDataFichas(dataIso),
        dataIso,
        desperdicioKg: desperdicio == null ? null : Number(desperdicio),
        cardapio: mapearRefeicao(refeicao),
        permiteRegistrarDesperdicio: indiceDia >= 0,
    };
}

export default function PainelNutricionistaPage() {
    const fichas = useFichasDia();
    const [dataInicial] = useState(dataIsoFortaleza);
    const dataIso = fichas.dados?.data ?? fichas.dataReferencia ?? dataInicial;
    const dataSegunda = obterSegundaIso(dataDeIsoLocal(dataIso));
    const [isWasteDialogOpen, setIsWasteDialogOpen] = useState(false);
    const [dadosSemana, setDadosSemana] = useState({
        referencia: null, semana: null, loading: true, error: "", atualizadoEm: null,
    });
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let ativo = true;
        listarSemanasApi()
            .then((semanas) => {
                if (!ativo) return;
                const semana = semanas.find((item) => item.data === dataSegunda) ?? null;
                setDadosSemana({ referencia: dataSegunda, semana, loading: false, error: "", atualizadoEm: new Date() });
            })
            .catch((erro) => {
                if (ativo) setDadosSemana({
                    referencia: dataSegunda, semana: null, loading: false,
                    error: erro?.message || "Não foi possível carregar os dados do painel.", atualizadoEm: null,
                });
            });
        return () => { ativo = false; };
    }, [dataSegunda, refreshKey]);

    const semanaAtual = dadosSemana.referencia === dataSegunda ? dadosSemana.semana : null;
    const dadosDashboard = {
        ...montarDadosDashboard(semanaAtual, dataIso),
        atualizadoEm: formatarAtualizacaoFichas(fichas.atualizadoEm ?? dadosSemana.atualizadoEm),
        fichasEntregues: fichas.dados?.entregues ?? null,
        fichasTotais: fichas.dados?.capacidade ?? null,
        fichasRestantes: fichas.dados?.restantes ?? null,
        fichasDiaUtil: fichas.dados ? diaUtilFichas(fichas.dados.data) : null,
        fichasCarregando: fichas.loading,
    };

    const recarregar = () => {
        setDadosSemana((anterior) => ({ ...anterior, loading: true, error: "" }));
        setRefreshKey((atual) => atual + 1);
        fichas.recarregar();
    };

    const registrarDesperdicio = async (value) => {
        const segundaDoRegistro = dataSegunda;
        const semana = await salvarDesperdicioDiaApi(dataIso, value);
        setDadosSemana((anterior) => {
            if (anterior.referencia && anterior.referencia !== segundaDoRegistro) return anterior;
            return { referencia: segundaDoRegistro, semana, loading: false, error: "", atualizadoEm: new Date() };
        });
    };

    const erroSemana = dadosSemana.referencia === dataSegunda ? dadosSemana.error : "";
    return (
        <ProtectedRoute allowedProfiles={["Nutricionista", "Gestor"]}>
            <DashboardNutricionista
                dadosDashboard={dadosDashboard}
                onWasteClick={() => setIsWasteDialogOpen(true)}
                onRefresh={recarregar}
                loading={dadosSemana.loading || dadosSemana.referencia !== dataSegunda || fichas.loading}
                error={[erroSemana, fichas.error].filter(Boolean).join(" ")}
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
