package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;

public record EstoqueCreateRequestDTO(
        String nome,
        Double quantidade,
        String unidade,
        String lote,
        LocalDate dataDeRecebimento,
        LocalDate dataDeValidade,
        String observacoes
) {
}
