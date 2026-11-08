"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "./authSession";
import { adicionarFichaHoje, consultarFichasHoje } from "./fichasService";

const ATUALIZACAO_MS = 5000;
const FICHAS_ALTERADAS = "fichas-dia-change";

export default function useFichasDia() {
    const router = useRouter();
    const [estado, setEstado] = useState({ dados: null, loading: true, error: "", atualizadoEm: null, dataReferencia: null });
    const [adicionando, setAdicionando] = useState(false);
    const [erroRegistro, setErroRegistro] = useState(null);
    const [sucesso, setSucesso] = useState("");
    const ativo = useRef(false);
    const sequencia = useRef(0);
    const leitura = useRef(null);
    const escrita = useRef(null);
    const registrando = useRef(false);
    const dadosAtuais = useRef(null);

    const aplicarDados = useCallback((dados) => {
        dadosAtuais.current = dados;
        setEstado({ dados, loading: false, error: "", atualizadoEm: new Date(), dataReferencia: dados.data });
    }, []);

    const consultar = useCallback(async (aposFalhaDeRegistro = false) => {
        if (!ativo.current || (registrando.current && !aposFalhaDeRegistro)) return;
        if (leitura.current && !leitura.current.signal.aborted) return;
        const atual = ++sequencia.current;
        leitura.current?.abort();
        const controller = new AbortController();
        leitura.current = controller;
        let expirou = false;
        const timeout = setTimeout(() => { expirou = true; controller.abort(); }, 12000);
        try {
            const dados = await consultarFichasHoje({ signal: controller.signal });
            if (ativo.current && atual === sequencia.current) aplicarDados(dados);
        } catch (error) {
            if (!ativo.current || (controller.signal.aborted && !expirou) || atual !== sequencia.current) return;
            dadosAtuais.current = null;
            setEstado((anterior) => ({
                dados: null, loading: false,
                error: expirou ? "A atualização demorou demais. Tente novamente." : error.message || "Não foi possível atualizar a contagem de fichas.",
                atualizadoEm: null, dataReferencia: anterior.dataReferencia,
            }));
        } finally {
            clearTimeout(timeout);
            if (leitura.current === controller) leitura.current = null;
        }
    }, [aplicarDados]);

    useEffect(() => {
        ativo.current = true;
        const atualizarSeVisivel = () => {
            if (document.visibilityState === "visible") void consultar();
        };
        void consultar();
        const intervalo = setInterval(atualizarSeVisivel, ATUALIZACAO_MS);
        document.addEventListener("visibilitychange", atualizarSeVisivel);
        window.addEventListener("focus", atualizarSeVisivel);
        window.addEventListener(FICHAS_ALTERADAS, atualizarSeVisivel);
        return () => {
            ativo.current = false;
            sequencia.current += 1;
            leitura.current?.abort();
            escrita.current?.abort();
            clearInterval(intervalo);
            document.removeEventListener("visibilitychange", atualizarSeVisivel);
            window.removeEventListener("focus", atualizarSeVisivel);
            window.removeEventListener(FICHAS_ALTERADAS, atualizarSeVisivel);
        };
    }, [consultar]);

    const recarregar = useCallback(() => {
        if (registrando.current) return;
        leitura.current?.abort();
        dadosAtuais.current = null;
        setEstado((anterior) => ({ ...anterior, loading: true, error: "" }));
        setErroRegistro(null);
        void consultar();
    }, [consultar]);

    const adicionar = useCallback(async () => {
        const referencia = dadosAtuais.current;
        if (!ativo.current || registrando.current || !referencia?.permiteAdicionar) return;
        registrando.current = true;
        sequencia.current += 1;
        leitura.current?.abort();
        setAdicionando(true);
        setErroRegistro(null);
        setSucesso("");
        const controller = new AbortController();
        escrita.current = controller;
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const dados = await adicionarFichaHoje({ signal: controller.signal });
            if (!ativo.current) return;
            aplicarDados(dados);
            setSucesso("Ficha registrada com sucesso.");
            window.dispatchEvent(new Event(FICHAS_ALTERADAS));
        } catch (error) {
            if (!ativo.current) return;
            if (error.status === 401) {
                clearAuthSession();
                router.replace("/login?motivo=sessao-expirada");
                return;
            }
            setErroRegistro({
                data: referencia.data,
                message: error.code === "NETWORK_ERROR" || error.code === "INVALID_RESPONSE"
                    ? "Não foi possível confirmar o registro. Confira a contagem atualizada antes de tentar novamente."
                    : error.message || "Não foi possível registrar a ficha.",
            });
            // A resposta pode ter se perdido depois da gravação: consultar nunca repete o POST.
            dadosAtuais.current = null;
            await consultar(true);
        } finally {
            clearTimeout(timeout);
            if (escrita.current === controller) escrita.current = null;
            registrando.current = false;
            if (ativo.current) setAdicionando(false);
        }
    }, [aplicarDados, consultar, router]);

    return {
        ...estado,
        adicionando,
        recarregar,
        adicionar,
        erroRegistro: !estado.dados || erroRegistro?.data === estado.dados.data ? erroRegistro?.message ?? "" : "",
        sucesso,
        limparSucesso: () => setSucesso(""),
    };
}
