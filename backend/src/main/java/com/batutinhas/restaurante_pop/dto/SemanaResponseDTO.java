package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;
import java.util.List;

public record SemanaResponseDTO(
        long idSemana,
        LocalDate data,
        List<Double> desperdicio,
        List<Integer> fichasVendidas,
        List<RefeicaoResponseDTO> cardapio
) {
}
