package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record NoticiaCreateRequestDTO(
        String assunto,
        String texto,
        LocalTime horario,
        LocalDate data,
        Integer duracao
) {
}
