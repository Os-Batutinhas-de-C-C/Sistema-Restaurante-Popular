"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { Box, Button, ButtonGroup, IconButton, Paper, Stack, Typography } from "@mui/material";
import ContrastIcon from "@mui/icons-material/Contrast";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import styles from "./accessibilityTools.module.css";

const FONT_LEVELS = [0.9, 1, 1.1];
const CONTRAST_STORAGE_KEY = "restaurante-popular:alto-contraste";
const CONTRAST_EVENT = "restaurante-popular:contraste-atualizado";
const SPEECH_EVENT = "restaurante-popular:leitura-atualizada";
let contrastSessionValue = false;
let contrastStorageUnavailable = false;
let activeSpeechPath = null;
let activeUtterance = null;

function getContrastSnapshot() {
    if (typeof window === "undefined") return false;
    if (contrastStorageUnavailable) return contrastSessionValue;
    try {
        contrastSessionValue = window.localStorage.getItem(CONTRAST_STORAGE_KEY) === "true";
    } catch {
        contrastStorageUnavailable = true;
    }
    return contrastSessionValue;
}

function subscribeToContrast(callback) {
    window.addEventListener("storage", callback);
    window.addEventListener(CONTRAST_EVENT, callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(CONTRAST_EVENT, callback);
    };
}

function setContrastPreference(enabled) {
    contrastSessionValue = enabled;
    try {
        window.localStorage.setItem(CONTRAST_STORAGE_KEY, String(enabled));
        contrastStorageUnavailable = false;
    } catch {
        contrastStorageUnavailable = true;
    }
    window.dispatchEvent(new Event(CONTRAST_EVENT));
}

function getSpeechSynthesis() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    return window.speechSynthesis;
}

function hasSpeechSupport() {
    return Boolean(getSpeechSynthesis() && typeof window.SpeechSynthesisUtterance === "function");
}

function subscribeToSpeech(callback) {
    const speech = getSpeechSynthesis();
    if (!speech || typeof speech.addEventListener !== "function") return () => {};
    speech.addEventListener("voiceschanged", callback);
    return () => speech.removeEventListener("voiceschanged", callback);
}

function subscribeToReading(callback) {
    window.addEventListener(SPEECH_EVENT, callback);
    return () => window.removeEventListener(SPEECH_EVENT, callback);
}

function publishReading(pathname, utterance) {
    activeSpeechPath = pathname;
    activeUtterance = utterance;
    window.dispatchEvent(new Event(SPEECH_EVENT));
}

export default function AccessibilityTools() {
    const pathname = usePathname();
    const highContrast = useSyncExternalStore(subscribeToContrast, getContrastSnapshot, () => false);
    const speechAvailable = useSyncExternalStore(subscribeToSpeech, hasSpeechSupport, () => false);
    const isReading = useSyncExternalStore(
        subscribeToReading,
        () => activeUtterance !== null && activeSpeechPath === pathname,
        () => false,
    );
    const [fontLevel, setFontLevel] = useState(1);
    const [toolbarExpanded, setToolbarExpanded] = useState(true);
    const [status, setStatus] = useState("");
    const [vlibrasStatus, setVlibrasStatus] = useState("");
    const toolbarContainer = useRef(null);

    useEffect(() => {
        if (highContrast) document.documentElement.dataset.highContrast = "true";
        else delete document.documentElement.dataset.highContrast;
    }, [highContrast]);

    useEffect(() => {
        const scale = String(FONT_LEVELS[fontLevel]);
        document.documentElement.style.setProperty("--accessibility-font-scale", scale);
        document.documentElement.style.fontSize = "calc(18px * " + scale + ")";
    }, [fontLevel]);


    const alignToolbarWithVlibras = useCallback(() => {
        if (typeof window.requestAnimationFrame !== "function") return;

        let attempts = 0;
        const align = () => {
            const button = window.VLibrasWidget?.initBtn;
            const container = toolbarContainer.current;
            if (!button || !container) {
                if (attempts++ < 20) window.requestAnimationFrame(align);
                return;
            }

            const buttonTop = button.getBoundingClientRect().top;
            const bottom = Math.max(8, Math.floor(window.innerHeight - buttonTop + 8));
            container.style.bottom = String(bottom) + "px";
        };

        window.requestAnimationFrame(align);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", alignToolbarWithVlibras);
        return () => window.removeEventListener("resize", alignToolbarWithVlibras);
    }, [alignToolbarWithVlibras]);

    const stopReading = useCallback(() => {
        const speech = getSpeechSynthesis();
        const utterance = activeUtterance;
        publishReading(null, null);
        if (speech && utterance) speech.cancel();
    }, []);

    useEffect(() => {
        if (activeUtterance && activeSpeechPath !== pathname) stopReading();
    }, [pathname, stopReading]);

    useEffect(() => () => {
        const speech = getSpeechSynthesis();
        const utterance = activeUtterance;
        publishReading(null, null);
        if (speech && utterance) speech.cancel();
    }, []);

    function setContrast(enabled) {
        setContrastPreference(enabled);
    }

    function initializeVlibras() {
        const Widget = window.VLibras?.Widget;
        if (typeof Widget !== "function") {
            setVlibrasStatus("O widget VLibras está indisponível no momento.");
            return;
        }

        new Widget({ rootPath: "https://vlibras.gov.br/app", position: "L" });
        alignToolbarWithVlibras();
        setVlibrasStatus("O widget VLibras foi carregado.");
    }

    function toggleReading() {
        const speech = getSpeechSynthesis();
        if (!speech || !speechAvailable) {
            setStatus("A leitura em voz alta não está disponível neste navegador.");
            return;
        }

        if (isReading) {
            stopReading();
            setStatus("Leitura interrompida.");
            return;
        }

        const mainContent = document.querySelector("main, [role='main']");
        const text = mainContent?.innerText?.trim();
        if (!text) {
            setStatus("Não há conteúdo principal disponível para leitura nesta página.");
            return;
        }

        speech.cancel();
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        const portugueseVoice = speech.getVoices().find((voice) => voice.lang?.toLowerCase() === "pt-br");
        if (portugueseVoice) utterance.voice = portugueseVoice;
        utterance.onend = () => {
            if (activeUtterance === utterance) {
                publishReading(null, null);
                setStatus("Leitura concluída.");
            }
        };
        utterance.onerror = () => {
            if (activeUtterance === utterance) {
                publishReading(null, null);
                setStatus("Não foi possível concluir a leitura em voz alta.");
            }
        };

        publishReading(pathname, utterance);
        setStatus("Leitura em voz alta iniciada.");
        speech.speak(utterance);
    }

    return (
        <>
            <Script
                id="vlibras-widget"
                src="https://vlibras.gov.br/app/vlibras-plugin.js"
                strategy="lazyOnload"
                onLoad={initializeVlibras}
                onError={() => setVlibrasStatus("O widget VLibras está indisponível no momento.")}
            />
            <Box ref={toolbarContainer} className={toolbarExpanded ? styles.toolbarContainer : styles.toolbarContainer + " " + styles.collapsed} style={{ position: "fixed", left: 58, bottom: 16, zIndex: 1200, width: "max-content", maxWidth: "calc(100vw - 68px)" }}>
                <Paper component="section" className={styles.toolbar} elevation={1} aria-label="Recursos de acessibilidade">
                    <Stack direction="row" className={styles.toolbarLayout}>
                        <Stack
                            id="accessibility-controls"
                            direction="row"
                            className={styles.controls}
                            role="toolbar"
                            aria-label="Barra de acessibilidade"
                            hidden={!toolbarExpanded}
                        >
                            <ButtonGroup size="small" variant="outlined" aria-label="Tamanho do texto">
                                <Button
                                    aria-label="Diminuir tamanho da fonte"
                                    aria-pressed={fontLevel === 0}
                                    disabled={fontLevel === 0}
                                    onClick={() => setFontLevel(0)}
                                >A-</Button>
                                <Button
                                    aria-label="Restaurar tamanho da fonte"
                                    aria-pressed={fontLevel === 1}
                                    disabled={fontLevel === 1}
                                    onClick={() => setFontLevel(1)}
                                >A</Button>
                                <Button
                                    aria-label="Aumentar tamanho da fonte"
                                    aria-pressed={fontLevel === 2}
                                    disabled={fontLevel === 2}
                                    onClick={() => setFontLevel(2)}
                                >A+</Button>
                            </ButtonGroup>
                            <Button
                                size="small"
                                variant={highContrast ? "contained" : "outlined"}
                                startIcon={<ContrastIcon />}
                                aria-pressed={highContrast}
                                onClick={() => setContrast(!highContrast)}
                            >Alto contraste</Button>
                            <Button
                                size="small"
                                variant={isReading ? "contained" : "outlined"}
                                startIcon={isReading ? <StopCircleIcon /> : <RecordVoiceOverIcon />}
                                aria-pressed={isReading}
                                aria-label={isReading ? "Interromper leitura em voz alta" : "Ler conteúdo em voz alta"}
                                disabled={!speechAvailable}
                                onClick={toggleReading}
                            >{isReading ? "Parar leitura" : "Ouvir conteúdo"}</Button>
                        </Stack>
                        <IconButton
                            size="small"
                            className={styles.toggleButton}
                            aria-label={toolbarExpanded ? "Ocultar barra de acessibilidade" : "Mostrar barra de acessibilidade"}
                            aria-expanded={toolbarExpanded}
                            aria-controls="accessibility-controls"
                            onClick={() => setToolbarExpanded((expanded) => !expanded)}
                        >
                            {toolbarExpanded ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
                        </IconButton>
                    </Stack>
                    {toolbarExpanded && (!speechAvailable || status) && (
                        <Typography className={styles.status} role="status" aria-live="polite">
                            {status || "A leitura em voz alta não está disponível neste navegador."}
                        </Typography>
                    )}
                    {toolbarExpanded && vlibrasStatus && (
                        <Typography className={styles.status} role="status" aria-live="polite">
                            {vlibrasStatus}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </>
    );
}





