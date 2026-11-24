"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { Box, Button, ButtonGroup, IconButton, Paper, Stack, Typography } from "@mui/material";
import ContrastIcon from "@mui/icons-material/Contrast";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import styles from "./accessibilityTools.module.css";

const FONT_LEVELS = [0.8, 0.9, 1, 1.1, 1.2];
const DEFAULT_FONT_LEVEL = 2;
const CONTRAST_STORAGE_KEY = "restaurante-popular:alto-contraste";
const CONTRAST_EVENT = "restaurante-popular:contraste-atualizado";
let contrastSessionValue = false;
let contrastStorageUnavailable = false;

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

export default function AccessibilityTools() {
    const highContrast = useSyncExternalStore(subscribeToContrast, getContrastSnapshot, () => false);
    const [fontLevel, setFontLevel] = useState(DEFAULT_FONT_LEVEL);
    const [toolbarExpanded, setToolbarExpanded] = useState(false);
    const [vlibrasStatus, setVlibrasStatus] = useState("");
    const toolbarContainer = useRef(null);

    useEffect(() => {
        if (highContrast) document.documentElement.dataset.highContrast = "true";
        else delete document.documentElement.dataset.highContrast;
    }, [highContrast]);

    useEffect(() => {
        document.documentElement.style.setProperty("--accessibility-font-scale", String(FONT_LEVELS[fontLevel]));
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

            const buttonBottom = button.getBoundingClientRect().bottom;
            container.style.bottom = String(Math.max(8, Math.floor(window.innerHeight - buttonBottom))) + "px";
        };

        window.requestAnimationFrame(align);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", alignToolbarWithVlibras);
        return () => window.removeEventListener("resize", alignToolbarWithVlibras);
    }, [alignToolbarWithVlibras]);

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

    return (
        <>
            <Script
                id="vlibras-widget"
                src="https://vlibras.gov.br/app/vlibras-plugin.js"
                strategy="lazyOnload"
                onLoad={initializeVlibras}
                onError={() => setVlibrasStatus("O widget VLibras está indisponível no momento.")}
            />
            <Box
                ref={toolbarContainer}
                data-accessibility-tools=""
                className={toolbarExpanded ? styles.toolbarContainer : styles.toolbarContainer + " " + styles.collapsed}
                style={{ position: "fixed", left: 58, bottom: 16, zIndex: 1200, width: "max-content", maxWidth: "calc(100vw - 68px)" }}
            >
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
                                    aria-pressed={fontLevel < DEFAULT_FONT_LEVEL}
                                    disabled={fontLevel === 0}
                                    onClick={() => setFontLevel((level) => Math.max(0, level - 1))}
                                >A-</Button>
                                <Button
                                    aria-label="Restaurar tamanho da fonte"
                                    aria-pressed={fontLevel === DEFAULT_FONT_LEVEL}
                                    disabled={fontLevel === DEFAULT_FONT_LEVEL}
                                    onClick={() => setFontLevel(DEFAULT_FONT_LEVEL)}
                                >A</Button>
                                <Button
                                    aria-label="Aumentar tamanho da fonte"
                                    aria-pressed={fontLevel > DEFAULT_FONT_LEVEL}
                                    disabled={fontLevel === FONT_LEVELS.length - 1}
                                    onClick={() => setFontLevel((level) => Math.min(FONT_LEVELS.length - 1, level + 1))}
                                >A+</Button>
                            </ButtonGroup>
                            <Button
                                size="small"
                                variant={highContrast ? "contained" : "outlined"}
                                startIcon={<ContrastIcon />}
                                aria-pressed={highContrast}
                                onClick={() => setContrastPreference(!highContrast)}
                            >Alto contraste</Button>
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
