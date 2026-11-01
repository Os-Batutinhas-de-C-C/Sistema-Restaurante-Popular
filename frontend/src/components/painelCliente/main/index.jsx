"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import "./style.css";

const VAZIO = { assunto: "", mensagem: "" };

export default function Main({ onEnviar }) {
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [status, setStatus] = useState("idle"); // idle | enviando | ok | erro

    const atualizar = (campo) => (e) => {
        const valor = e.target.value;
        setForm((f) => ({ ...f, [campo]: valor }));
        setErros((x) => ({ ...x, [campo]: undefined }));
        setStatus("idle");
    };

    function validar() {
        const e = {};
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