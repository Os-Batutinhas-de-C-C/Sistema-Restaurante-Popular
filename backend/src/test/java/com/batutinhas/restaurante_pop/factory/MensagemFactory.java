package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.dto.MensagemCreateRequestDTO;
import com.batutinhas.restaurante_pop.model.Mensagem;
import com.batutinhas.restaurante_pop.model.Usuario;

import java.time.LocalDate;
import java.time.LocalTime;

public final class MensagemFactory {
    private MensagemFactory() {
    }

    public static MensagemCreateRequestDTO criarMensagemCreateRequestDTO() {
        return new MensagemCreateRequestDTO(
                "Duvida sobre o cardapio",
                "Gostaria de confirmar a opcao vegetariana.",
                LocalTime.of(9, 15),
                LocalDate.of(2026, 10, 12)
        );
    }

    public static MensagemCreateRequestDTO criarRequestSemTexto() {
        MensagemCreateRequestDTO request = criarMensagemCreateRequestDTO();
        return new MensagemCreateRequestDTO(request.assunto(), null, request.horario(), request.data());
    }

    public static Mensagem criarMensagemEntidadeValida(Usuario usuario) {
        MensagemCreateRequestDTO request = criarMensagemCreateRequestDTO();
        Mensagem mensagem = new Mensagem();
        mensagem.setAssunto(request.assunto());
        mensagem.setTexto(request.texto());
        mensagem.setHorario(request.horario());
        mensagem.setData(request.data());
        mensagem.setUsuario(usuario);
        return mensagem;
    }
}