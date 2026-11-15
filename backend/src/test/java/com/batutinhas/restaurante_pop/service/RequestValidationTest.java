package com.batutinhas.restaurante_pop.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/** RF011: protege obrigatoriedade e limites sem acrescentar normalização aos contratos. */
@DisplayName("Validação compartilhada de textos")
class RequestValidationTest {
    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n", "\u2003"})
    @DisplayName("Texto obrigatório rejeita ausência e espaços")
    void textoObrigatorioRejeitaAusencia(String valor) {
        IllegalArgumentException erro = assertThrows(IllegalArgumentException.class,
                () -> RequestValidation.requiredText(valor, "assunto", 10));

        assertEquals("assunto é obrigatório.", erro.getMessage());
    }

    @Test
    @DisplayName("Texto obrigatório aceita o limite e preserva espaços")
    void textoObrigatorioPreservaConteudo() {
        String valor = "  aviso  ";

        String resultado = RequestValidation.requiredText(valor, "assunto", valor.length());

        assertSame(valor, resultado);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "12345"})
    @DisplayName("Texto opcional aceita nulo, vazio e o comprimento máximo")
    void textoOpcionalAceitaConteudoPermitido(String valor) {
        assertSame(valor, RequestValidation.text(valor, "assunto", 5));
    }

    @Test
    @DisplayName("Texto opcional não remove espaços")
    void textoOpcionalPreservaEspacos() {
        assertEquals(" aviso ", RequestValidation.text(" aviso ", "assunto", 7));
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    @DisplayName("Ambas as validações rejeitam um caractere além do limite")
    void rejeitaComprimentoExcedido(boolean obrigatorio) {
        IllegalArgumentException erro = assertThrows(IllegalArgumentException.class, () -> {
            if (obrigatorio) RequestValidation.requiredText("123456", "assunto", 5);
            else RequestValidation.text("123456", "assunto", 5);
        });

        assertEquals("assunto excede o limite de 5 caracteres.", erro.getMessage());
    }

    @Test
    @DisplayName("Limite genérico conta unidades UTF-16 de caracteres suplementares")
    void comprimentoUsaUnidadesUtf16() {
        String caractereSuplementar = "\uD83C\uDF5A";

        assertEquals(caractereSuplementar, RequestValidation.text(caractereSuplementar, "assunto", 2));
        assertThrows(IllegalArgumentException.class,
                () -> RequestValidation.text(caractereSuplementar, "assunto", 1));
    }
}
