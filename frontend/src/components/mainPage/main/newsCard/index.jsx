"use client";

import { useState, useRef } from "react";
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
  
  const lastClickTime = useRef(0);

  if (total === 0) return null;

  const handleNavigation = (direction) => {
    const now = Date.now();
    if (now - lastClickTime.current < 150) return;
    lastClickTime.current = now;

    setI((prevI) => (prevI + direction + total) % total);
  };

  return (
    <section id={id} className="newsBoxes">
      <div className="newsBoxBorder">
        <span className="tag"><span className="dot" />Notícias</span>
        <hr className="divider" />
        
        <div className="slides">
          {NOTICIAS.map((n, k) => (
            <div 
              key={n.id || k} 
              className={`slide ${k === i ? "active" : ""}`}
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
            {NOTICIAS.map((n, k) => (
              <button
                key={n.id || k}
                className={`pill ${k === i ? "active" : ""}`}
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