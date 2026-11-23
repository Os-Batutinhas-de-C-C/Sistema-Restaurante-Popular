"use client";

import { useCallback, useEffect, useState } from "react";

export function marcarHorario(dados) {
    return { ...dados, recebidoEm: performance.now() };
}

function horarioAtual(agenda) {
    return Date.parse(agenda.agora) + performance.now() - agenda.recebidoEm;
}

export function useHorarioAgenda(agenda, onLimite) {
    const [observacao, setObservacao] = useState(null);

    useEffect(() => {
        if (!agenda) return;
        const limites = agenda.eventos?.flatMap(({ inicioEm, fimEm }) => [Date.parse(inicioEm), Date.parse(fimEm)])
            ?? [Date.parse(agenda.inicioEm)];
        let timer;
        function agendar() {
            clearTimeout(timer);
            const agora = horarioAtual(agenda);
            setObservacao({ agenda, agora });
            const proximo = limites.reduce((menor, limite) => limite > agora ? Math.min(menor, limite) : menor, Infinity);
            if (Number.isFinite(proximo)) {
                timer = setTimeout(() => {
                    if (horarioAtual(agenda) >= proximo) onLimite?.();
                    agendar();
                }, Math.min(Math.ceil(proximo - agora), 2_147_483_647));
            }
        }
        timer = setTimeout(agendar, 0);
        window.addEventListener("focus", agendar);
        document.addEventListener("visibilitychange", agendar);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("focus", agendar);
            document.removeEventListener("visibilitychange", agendar);
        };
    }, [agenda, onLimite]);

    return observacao && observacao.agenda === agenda ? observacao.agora : Date.parse(agenda?.agora);
}

export function useAgendaOficinas(carregar, { revalidarNosLimites = false } = {}) {
    const [ciclo, setCiclo] = useState(0);
    const [consulta, setConsulta] = useState({});
    const recarregar = useCallback(() => setCiclo((anterior) => anterior + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        carregar(controller.signal)
            .then((dados) => {
                if (!controller.signal.aborted) setConsulta({ carregar, ciclo, agenda: marcarHorario(dados) });
            })
            .catch((erro) => {
                if (!controller.signal.aborted) setConsulta((anterior) => ({
                    carregar, ciclo, erro: erro.message,
                    agenda: anterior.carregar === carregar ? anterior.agenda : null,
                }));
            });
        return () => controller.abort();
    }, [carregar, ciclo]);

    const mesmaConsulta = consulta.carregar === carregar;
    const agenda = mesmaConsulta ? consulta.agenda : null;
    const agora = useHorarioAgenda(agenda, revalidarNosLimites ? recarregar : undefined);
    return {
        agenda, agora, recarregar,
        carregando: !mesmaConsulta || consulta.ciclo !== ciclo,
        erro: mesmaConsulta && consulta.ciclo === ciclo ? consulta.erro : "",
    };
}
