"use client";

import { useState } from "react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./style.css";
import { NOTICIAS } from "./noticiasMock";

export default function NewsCard({ id }) {
  const [i, setI] = useState(0);
  const total = NOTICIAS.length;
  if (total === 0) return null;

  const prev = () => setI((i - 1 + total) % total);
  const next = () => setI((i + 1) % total);

  return (
    <section id={id} className="newsBoxes">
      <div className="newsBoxBorder">
        <span className="tag"><span className="dot" />Notícias</span>
        <hr className="divider" />
        <div className="slides">
          {NOTICIAS.map((n, k) => (
            <div key={k} className={`slide ${k === i ? "active" : ""}`}>
              <p className="title">{n.titulo}</p>
              <p className="article">{n.texto}</p>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="controls">
          <div className="indicators">
            {NOTICIAS.map((_, k) => (
              <button
                key={k}
                className={`pill ${k === i ? "active" : ""}`}
                onClick={() => setI(k)}
                aria-label={`Ir para notícia ${k + 1}`}
              />
            ))}
          </div>
          <div className="arrows">
            <button className="arrow" onClick={prev} aria-label="Anterior">
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button className="arrow" onClick={next} aria-label="Próxima">
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}