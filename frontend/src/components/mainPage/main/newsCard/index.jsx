"use client";

import { useState, useRef, useEffect } from "react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./style.css";
import { listarNoticiasPorPeriodo } from "../../../../services/noticiasService";

export default function NewsCard({ id }) {
  const [i, setI] = useState(0);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const lastClickTime = useRef(0);

  useEffect(() => {
    let ativo = true;

    listarNoticiasPorPeriodo()
      .then((resultado) => {
        if (ativo) setNoticias(resultado);
      })
      .catch((erro) => {
        if (ativo) setError(erro?.message || "Não foi possível carregar as notícias.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const total = noticias.length;
  const indiceAtual = total ? i % total : 0;

  const handleNavigation = (direction) => {
    if (!total) return;
    const now = Date.now();
    if (now - lastClickTime.current < 150) return;
    lastClickTime.current = now;

    setI((prevI) => (prevI + direction + total) % total);
  };

  if (loading || error || total === 0) {
    return (
      <section id={id} className="newsBoxes">
        <div className="newsBoxBorder">
          <span className="tag"><span className="dot" />Notícias</span>
          <hr className="divider" />
          <div className="slides">
            <p className="article">
              {loading ? "Carregando notícias…" : error || "Nenhuma notícia disponível."}
            </p>
            {error && (
              <button type="button" className="retry" onClick={() => {
                setLoading(true);
                setError("");
                setTentativa((atual) => atual + 1);
              }}>
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="newsBoxes">
      <div className="newsBoxBorder">
        <span className="tag"><span className="dot" />Notícias</span>
        <hr className="divider" />
        
        <div className="slides">
          {noticias.map((n, k) => (
            <div 
              key={n.id || k} 
              className={`slide ${k === indiceAtual ? "active" : ""}`}
              aria-hidden={k !== i}
            >
              <p className="title">{n.titulo}</p>
              <p className="article">{n.texto}</p>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="controls">
          <div className="indicators">
            {noticias.map((n, k) => (
              <button
                key={n.id || k}
                className={`pill ${k === indiceAtual ? "active" : ""}`}
                onClick={() => {
                  const now = Date.now();
                  if (now - lastClickTime.current < 300) return;
                  lastClickTime.current = now;
                  setI(k);
                }}
                aria-label={`Ir para notícia ${k + 1}`}
              />
            ))}
          </div>
          <div className="arrows">
            <button className="arrow" onClick={() => handleNavigation(-1)} aria-label="Anterior">
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button className="arrow" onClick={() => handleNavigation(1)} aria-label="Próxima">
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
