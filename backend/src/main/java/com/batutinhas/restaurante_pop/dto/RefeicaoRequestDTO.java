package com.batutinhas.restaurante_pop.dto;

public record RefeicaoRequestDTO(
        Long idRefeicao,
        String proteina,
        String guarnicao,
        String acompanhamento1,
        String acompanhamento2,
        String suco,
        String sobremesa,
        String opcaoProteica,
        Double calorias
) {
    public boolean hasMealFields() {
        return proteina != null
                || guarnicao != null
                || acompanhamento1 != null
                || acompanhamento2 != null
                || suco != null
                || sobremesa != null
                || opcaoProteica != null
                || calorias != null;
    }
}
