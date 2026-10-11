"use client";

import { useState } from "react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./style.css";

const noticias = [
  {
    titulo: "Novo cardápio balanceado com ingredientes da agricultura familiar do Sertão Central",
    texto: "Hortaliças frescas, polpas de frutas e feijão de corda fornecidos diretamente por pequenos produtores rurais cadastrados no município.",
  },
  { titulo: "Título da segunda notícia", texto: "Texto da segunda notícia." },
  { titulo: "Título da terceira notícia", texto: "Texto da terceira notícia." },
];

export default function NewsCard({ id }) {
  const [i, setI] = useState(0);
  const total = noticias.length;
  if (total == 0) return null;

  const prev = () => setI((i - 1 + total) % total);
  const next = () => setI((i + 1) % total);

  return (
    <section id={id} className="newsBoxes">
      <div className="newsBoxBorder">
        <span className="tag"><span className="dot" />Notícias</span>
        <hr className="divider" />
        <div className="slides">
          {noticias.map((n, k) => (
            <div key={k} className={`slide ${k === i ? "active" : ""}`}>
              <p className="title">{n.titulo}</p>
              <p className="article">{n.texto}</p>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="controls">
          <div className="indicators">
            {noticias.map((_, k) => (
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