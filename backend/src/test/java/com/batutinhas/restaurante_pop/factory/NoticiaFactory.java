package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.dto.NoticiaCreateRequestDTO;
import com.batutinhas.restaurante_pop.model.Noticia;
import com.batutinhas.restaurante_pop.model.Usuario;

import java.time.LocalDate;
import java.time.LocalTime;

public final class NoticiaFactory {
    private NoticiaFactory() {
    }

    public static NoticiaCreateRequestDTO criarNoticiaCreateRequestDTO() {
        return new NoticiaCreateRequestDTO(
                "Aviso do restaurante",
                "O cardapio da semana esta disponivel.",
                LocalTime.of(8, 30),
                LocalDate.of(2026, 10, 12),
                24
        );
    }

    public static NoticiaCreateRequestDTO criarRequestComDuracaoInvalida() {
        NoticiaCreateRequestDTO request = criarNoticiaCreateRequestDTO();
        return new NoticiaCreateRequestDTO(
                request.assunto(),
                request.texto(),
                request.horario(),
                request.data(),
                73
        );
    }

    public static Noticia criarNoticiaEntidadeValida(Usuario usuario) {
        NoticiaCreateRequestDTO request = criarNoticiaCreateRequestDTO();
        Noticia noticia = new Noticia();
        noticia.setAssunto(request.assunto());
        noticia.setTexto(request.texto());
        noticia.setHorario(request.horario());
        noticia.setData(request.data());
        noticia.setDuracao(request.duracao());
        noticia.setUsuario(usuario);
        return noticia;
    }
}