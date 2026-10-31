"use client";

import { useState } from "react";
import { DayPicker } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale/pt-BR";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { IconButton, InputAdornment, Popover, TextField, Typography } from "@mui/material";
import styles from "./seletorIntervaloDatas.module.css";

function formatarData(data) {
    return new Intl.DateTimeFormat("pt-BR").format(data);
}

function formatarIntervalo(intervalo) {
    if (!intervalo?.from) return "";
    if (!intervalo.to) return `${formatarData(intervalo.from)} –`;
    return `${formatarData(intervalo.from)} – ${formatarData(intervalo.to)}`;
}

function formatarIso(data) {
    if (!data) return "";
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export default function SeletorIntervaloDatas({
    value,
    onChange,
    label = "Selecione o período",
    ariaLabel = "Abrir seletor de período",
    exibirIconeCalendario = true,
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const aberto = Boolean(anchorEl);

    const abrirCalendario = (event) => {
        setAnchorEl(event.currentTarget.closest(".MuiFormControl-root") ?? event.currentTarget);
    };

    return (
        <>
            <TextField
                label={label}
                size="small"
                value={formatarIntervalo(value)}
                onClick={abrirCalendario}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") abrirCalendario(event);
                }}
                fullWidth
                slotProps={{
                    input: {
                        readOnly: true,
                        endAdornment: exibirIconeCalendario ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={ariaLabel}
                                    aria-haspopup="dialog"
                                    aria-expanded={aberto}
                                    onClick={abrirCalendario}
                                    edge="end"
                                >
                                    <CalendarMonthOutlinedIcon />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined,
                    },
                    htmlInput: {
                        readOnly: true,
                        "aria-haspopup": "dialog",
                        "aria-expanded": aberto,
                    },
                }}
            />
            <Popover
                open={aberto}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { className: styles.calendarPaper } }}
            >
                <DayPicker
                    mode="range"
                    locale={ptBR}
                    weekStartsOn={0}
                    resetOnSelect
                    selected={value}
                    onSelect={onChange}
                    defaultMonth={value?.from}
                    className={styles.calendar}
                    footer={(
                        <Typography component="p" variant="caption" className={styles.selectionFooter}>
                            {value?.from && formatarIso(value.from)}
                            {value?.to && ` — ${formatarIso(value.to)}`}
                        </Typography>
                    )}
                />
            </Popover>
        </>
    );
}
