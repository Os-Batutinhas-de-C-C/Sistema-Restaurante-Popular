package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record MensagemResponseDTO(
        long idMensagem,
        String assunto,
        String texto,
        LocalTime horario,
        LocalDate data,
        Long usuarioId
) {
}
