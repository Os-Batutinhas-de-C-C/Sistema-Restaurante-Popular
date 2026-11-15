package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record NoticiaResponseDTO(
        long idMensagem,
        String assunto,
        String texto,
        LocalTime horario,
        LocalDate data,
        int duracao
) {
}
