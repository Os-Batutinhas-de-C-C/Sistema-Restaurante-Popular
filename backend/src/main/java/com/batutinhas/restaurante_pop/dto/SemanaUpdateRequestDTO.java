package com.batutinhas.restaurante_pop.dto;

import java.util.List;

public record SemanaUpdateRequestDTO(
        List<Double> desperdicio,
        List<Integer> fichasVendidas,
        List<RefeicaoRequestDTO> cardapio
) {
}
