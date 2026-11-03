package com.batutinhas.restaurante_pop.dto;

public record RefeicaoCreateRequestDTO(
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
    public RefeicaoCreateRequestDTO(String proteina, String guarnicao, String acompanhamento1,
                                   String acompanhamento2, String suco, String sobremesa,
                                   String opcaoProteica, Double calorias) {
        this(proteina, guarnicao, acompanhamento1, acompanhamento2, suco, sobremesa,
                opcaoProteica, calorias, null);
    }
}
