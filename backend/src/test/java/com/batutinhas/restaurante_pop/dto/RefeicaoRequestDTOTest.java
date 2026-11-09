package com.batutinhas.restaurante_pop.dto;

import com.batutinhas.restaurante_pop.factory.RefeicaoFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

/** RF006: distinguir referência por ID de campos para criação inline. */
class RefeicaoRequestDTOTest {
    @Test
    @DisplayName("ID sozinho não representa campos de criação")
    void referenciaSemCamposDeCriacao() {
        assertFalse(RefeicaoFactory.criarReferenciaDeRefeicao(7L).hasMealFields());
        assertFalse(new RefeicaoRequestDTO(null, null, null, null, null, null, null, null, null, null).hasMealFields());
    }

    @ParameterizedTest(name = "campo {0} presente")
    @CsvSource({"proteina, 0", "guarnicao, 1", "acompanhamento1, 2", "acompanhamento2, 3",
            "suco, 4", "sobremesa, 5", "opcaoProteica, 6", "saladaDoDia, 7", "calorias, 8"})
    @DisplayName("Cada campo não nulo conta como criação, inclusive string vazia e calorias zero")
    void reconheceCadaCampoIsolado(String campo, int indice) {
        var campos = new String[8];
        if (indice < 8) campos[indice] = "";
        var request = new RefeicaoRequestDTO(null, campos[0], campos[1], campos[2], campos[3], campos[4],
                campos[5], campos[6], indice == 8 ? 0.0 : null, campos[7]);

        assertTrue(request.hasMealFields());
    }
}
