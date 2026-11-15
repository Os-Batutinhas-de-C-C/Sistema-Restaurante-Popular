package com.batutinhas.restaurante_pop.dto;

import java.time.LocalDate;

public record EstoqueResponseDTO(
        long idMaterial,
        String nome,
        double quantidade,
        String unidade,
        String lote,
        LocalDate dataDeRecebimento,
        LocalDate dataDeValidade,
        String observacoes,
        String status
) {
}
