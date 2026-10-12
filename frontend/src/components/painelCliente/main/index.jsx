"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import "./style.css";

function formatarTelefone(valor) {
    const d = valor.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

const VAZIO = { telefone: "", assunto: "", mensagem: "" };

export default function Main({ onEnviar }) {
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [status, setStatus] = useState("idle"); // idle | enviando | ok | erro

    const atualizar = (campo) => (e) => {
        const valor = campo === "telefone" ? formatarTelefone(e.target.value) : e.target.value;
        setForm((f) => ({ ...f, [campo]: valor }));
        setErros((x) => ({ ...x, [campo]: undefined }));
        setStatus("idle");
    };

    function validar() {
        const e = {};
        if (form.telefone.replace(/\D/g, "").length !== 11) e.telefone = "Informe o telefone com DDD.";
        if (!form.assunto.trim()) e.assunto = "Informe o assunto da mensagem.";
        if (form.mensagem.trim().length < 10) e.mensagem = "Descreva sua solicitação (mínimo de 10 caracteres).";
        return e;
    }

    async function enviar(ev) {
        ev.preventDefault();
        const e = validar();
        setErros(e);
        if (Object.keys(e).length) return;

        setStatus("enviando");
        try {
            if (!onEnviar) throw new Error("Passe a prop onEnviar com a chamada à sua API.");
            await onEnviar({ ...form, telefone: form.telefone.replace(/\D/g, "") });
            setForm(VAZIO);
            setStatus("ok");
        } catch (err) {
            console.error(err);
            setStatus("erro");
        }
    }

    return (
        <div className="contato">
            <section className="contatoCard" aria-labelledby="contatoTitulo">
                <h1 id="contatoTitulo" className="contatoTitulo">Fale Conosco</h1>
                <p className="contatoSub">Envie sua mensagem para a nossa equipe.</p>

                <form onSubmit={enviar} noValidate>
                    <div className="contatoCampo">
                        <label htmlFor="contato-telefone">Telefone:</label>
                        <input
                            id="contato-telefone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="(00) 0 0000-0000"
                            value={form.telefone}
                            onChange={atualizar("telefone")}
                            aria-invalid={!!erros.telefone}
                            aria-describedby={erros.telefone ? "contato-erro-telefone" : undefined}
                        />
                        {erros.telefone && <span id="contato-erro-telefone" className="contatoErro">{erros.telefone}</span>}
                    </div>

                    <div className="contatoCampo">
                        <label htmlFor="contato-assunto">Assunto da mensagem:</label>
                        <input
                            id="contato-assunto"
                            type="text"
                            maxLength={100}
                            placeholder="Título da mensagem"
                            value={form.assunto}
                            onChange={atualizar("assunto")}
                            aria-invalid={!!erros.assunto}
                            aria-describedby={erros.assunto ? "contato-erro-assunto" : undefined}
                        />
                        {erros.assunto && <span id="contato-erro-assunto" className="contatoErro">{erros.assunto}</span>}
                    </div>

                    <div className="contatoCampo">
                        <label htmlFor="contato-mensagem">Mensagem:</label>
                        <textarea
                            id="contato-mensagem"
                            maxLength={1000}
                            placeholder="Descreva sua solicitação..."
                            value={form.mensagem}
                            onChange={atualizar("mensagem")}
                            aria-invalid={!!erros.mensagem}
                            aria-describedby={erros.mensagem ? "contato-erro-mensagem" : undefined}
                        />
                        {erros.mensagem && <span id="contato-erro-mensagem" className="contatoErro">{erros.mensagem}</span>}
                    </div>

                    <div className="contatoAcoes">
                        <Button type="submit" variant="contained" disabled={status === "enviando"}>
                            {status === "enviando" ? "Enviando..." : "Enviar mensagem"}
                        </Button>
                    </div>

                    <p role="status" aria-live="polite" className={`contatoStatus ${status}`}>
                        {status === "ok" && "Mensagem enviada! Em breve nossa equipe entrará em contato."}
                        {status === "erro" && "Não foi possível enviar sua mensagem. Tente novamente."}
                    </p>
                </form>
            </section>
        </div>
    );
}