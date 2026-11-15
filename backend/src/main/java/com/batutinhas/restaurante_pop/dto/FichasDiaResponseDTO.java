package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;

public record FichasDiaResponseDTO(
        LocalDate data,
        int entregues,
        int capacidade,
        int restantes,
        boolean permiteAdicionar
) {
}
