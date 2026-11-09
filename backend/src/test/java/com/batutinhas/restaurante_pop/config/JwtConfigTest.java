package com.batutinhas.restaurante_pop.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

/** RF011: valida somente a chave configurada; não inicia Spring nem testa criptografia da biblioteca. */
class JwtConfigTest {
    private final JwtConfig config = new JwtConfig();

    @Test
    @DisplayName("Chave fora do formato Base64 impede configuração insegura")
    void rejeitaBase64Invalido() {
        assertThrows(IllegalStateException.class, () -> config.jwtSecretKey("chave%invalida"));
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 31})
    @DisplayName("Chave com menos de 32 bytes é rejeitada")
    void rejeitaChaveCurta(int tamanho) {
        String base64 = Base64.getEncoder().encodeToString(new byte[tamanho]);

        assertThrows(IllegalStateException.class, () -> config.jwtSecretKey(base64));
    }

    @ParameterizedTest
    @ValueSource(ints = {32, 33, 64})
    @DisplayName("Chave com pelo menos 32 bytes preserva bytes e algoritmo")
    void aceitaChaveSuficiente(int tamanho) {
        byte[] bytes = new byte[tamanho]; // Material fictício exclusivo deste teste.
        String base64 = Base64.getEncoder().encodeToString(bytes);

        var chave = config.jwtSecretKey(base64);

        assertEquals("HmacSHA256", chave.getAlgorithm());
        assertArrayEquals(bytes, chave.getEncoded());
    }
}
