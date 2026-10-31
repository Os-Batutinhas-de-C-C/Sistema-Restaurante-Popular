"use client";

import { useState } from "react";
import { DayPicker } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale/pt-BR";
import { CalendarMonthOutlined } from "@mui/icons-material";
import { IconButton, InputAdornment, Popover, TextField } from "@mui/material";
import styles from "./seletorDataEstoque.module.css";

function dataParaIso(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function dataParaExibicao(iso) {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

export default function SeletorDataEstoque({ label, value, onChange }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const selecionada = value ? new Date(`${value}T12:00:00`) : undefined;
    const aberto = Boolean(anchorEl);

    const abrirCalendario = (event) => {
        setAnchorEl(event.currentTarget.closest(".MuiFormControl-root") ?? event.currentTarget);
    };

    const selecionarData = (data) => {
        if (!data) return;
        onChange(dataParaIso(data));
        setAnchorEl(null);
    };

    return (
        <>
            <TextField
                label={label}
                type="text"
                value={dataParaExibicao(value)}
                placeholder="dd/mm/aaaa"
                onClick={abrirCalendario}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") abrirCalendario(event);
                }}
                fullWidth
                required
                slotProps={{
                    input: {
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton aria-label={`Selecionar ${label.toLocaleLowerCase("pt-BR")}`} aria-haspopup="dialog" aria-expanded={aberto} onClick={abrirCalendario} edge="end">
                                    <CalendarMonthOutlined />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                    htmlInput: { readOnly: true, "aria-haspopup": "dialog", "aria-expanded": aberto },
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
                    mode="single"
                    locale={ptBR}
                    weekStartsOn={0}
                    selected={selecionada}
                    onSelect={selecionarData}
                    defaultMonth={selecionada}
                    className={styles.calendar}
                />
            </Popover>
        </>
    );
}
