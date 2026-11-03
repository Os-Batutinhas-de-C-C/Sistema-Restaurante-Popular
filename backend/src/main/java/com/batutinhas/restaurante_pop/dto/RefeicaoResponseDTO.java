package com.batutinhas.restaurante_pop.dto;

public record RefeicaoResponseDTO(
        long idRefeicao,
        String proteina,
        String guarnicao,
        String acompanhamento1,
        String acompanhamento2,
        String suco,
        String sobremesa,
        String opcaoProteica,
        double calorias
) {
}
