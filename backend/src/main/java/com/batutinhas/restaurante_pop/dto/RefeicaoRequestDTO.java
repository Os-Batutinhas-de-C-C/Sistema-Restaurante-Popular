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
        Double calorias,
        String saladaDoDia
) {
    public RefeicaoRequestDTO(Long idRefeicao, String proteina, String guarnicao,
                              String acompanhamento1, String acompanhamento2, String suco,
                              String sobremesa, String opcaoProteica, Double calorias) {
        this(idRefeicao, proteina, guarnicao, acompanhamento1, acompanhamento2, suco,
                sobremesa, opcaoProteica, calorias, null);
    }

    public boolean hasMealFields() {
        return proteina != null
                || guarnicao != null
                || acompanhamento1 != null
                || acompanhamento2 != null
                || suco != null
                || sobremesa != null
                || opcaoProteica != null
                || calorias != null
                || saladaDoDia != null;
    }
}
