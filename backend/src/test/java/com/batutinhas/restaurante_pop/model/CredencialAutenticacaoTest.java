package com.batutinhas.restaurante_pop.model;

import com.batutinhas.restaurante_pop.factory.CredencialFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** RF012: protege a sequência usada para revogar tokens, inclusive contra estouro. */
@DisplayName("RF012 — Versão das credenciais")
class CredencialAutenticacaoTest {
    @Test
    @DisplayName("Nova credencial inicia na versão zero e cada revogação avança uma versão")
    void revogacaoIncrementaVersaoInicial() {
        var credencial = CredencialFactory.criarCredencialValida();
        assertThat(credencial.getVersaoToken()).isZero();

        credencial.incrementarVersaoToken();

        assertThat(credencial.getVersaoToken()).isEqualTo(1);
    }

    @Test
    @DisplayName("Estouro da versão falha sem transformá-la em número negativo")
    void estouroMantemVersaoMaxima() {
        var credencial = CredencialFactory.criarCredencialValida();
        credencial.setVersaoToken(Long.MAX_VALUE);

        assertThatThrownBy(credencial::incrementarVersaoToken).isInstanceOf(ArithmeticException.class);

        assertThat(credencial.getVersaoToken()).isEqualTo(Long.MAX_VALUE);
    }
}
