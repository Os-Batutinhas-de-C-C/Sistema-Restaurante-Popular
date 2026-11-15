package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;
import java.util.List;

public record CardapioPublicoResponseDTO(
        LocalDate data,
        List<RefeicaoResponseDTO> cardapio
) {
}
