package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;
import java.util.List;

public record SemanaCreateRequestDTO(
        LocalDate data,
        List<Double> desperdicio,
        List<Integer> fichasVendidas,
        List<RefeicaoRequestDTO> cardapio
) {
}
