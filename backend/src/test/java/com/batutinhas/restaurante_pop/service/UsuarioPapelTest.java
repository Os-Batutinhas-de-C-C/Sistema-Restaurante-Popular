package com.batutinhas.restaurante_pop.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** RF007: mantém papéis de segurança e rótulos coerentes, inclusive o fallback. */
class UsuarioPapelTest {
    @ParameterizedTest(name = "{0}: {1} / {2}")
    @CsvSource({
            "N,NUTRICIONISTA,Nutricionista", "n,NUTRICIONISTA,Nutricionista",
            "C,CAIXA,Caixa", "c,CAIXA,Caixa", "G,GESTOR,Gestor", "g,GESTOR,Gestor",
            "X,USUARIO_COMUM,Usuário"
    })
    @DisplayName("Cada tipo usa o papel e o rótulo previstos")
    void mapeiaPapelERotulo(char tipo, String papel, String rotulo) {
        assertEquals(papel, UsuarioPapel.role(tipo));
        assertEquals(rotulo, UsuarioPapel.label(tipo));
    }
}
