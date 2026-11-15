package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.dto.ApiErrorDTO;
import com.batutinhas.restaurante_pop.exception.FichasException;
import com.batutinhas.restaurante_pop.exception.PerfilException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpStatus;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/** RF011: verifica a tradução direta de erros, sem simular a seleção de handlers pelo Spring. */
@DisplayName("Tradução segura de exceções da API")
class ApiExceptionHandlerTest {
    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    @DisplayName("Erro de fichas mantém código e mensagem com status de conflito")
    void traduzErroDeFichas() {
        FichasException erro = new FichasException("FICHAS_LIMIT_REACHED", "Limite diário atingido.");

        var resposta = handler.handleFichas(erro);

        assertEquals(HttpStatus.CONFLICT, resposta.getStatusCode());
        assertEquals(new ApiErrorDTO("FICHAS_LIMIT_REACHED", "Limite diário atingido."), resposta.getBody());
    }

    @ParameterizedTest
    @EnumSource(value = HttpStatus.class, names = {"BAD_REQUEST", "UNAUTHORIZED", "NOT_FOUND", "CONFLICT"})
    @DisplayName("Erro de perfil preserva o status e os detalhes públicos de domínio")
    void traduzErroDePerfil(HttpStatus status) {
        PerfilException erro = new PerfilException(status, "PROFILE_TEST_ERROR", "Mensagem pública de teste.");

        var resposta = handler.handlePerfil(erro);

        assertEquals(status, resposta.getStatusCode());
        assertEquals(new ApiErrorDTO("PROFILE_TEST_ERROR", "Mensagem pública de teste."), resposta.getBody());
    }

    @ParameterizedTest
    @MethodSource("errosDeEntrada")
    @DisplayName("Erros de argumento e estado recebem resposta genérica sem detalhes internos")
    void ocultaDetalhesDeEntradaInvalida(RuntimeException erro) {
        var resposta = handler.handleInvalidRequest(erro);

        assertEquals(HttpStatus.BAD_REQUEST, resposta.getStatusCode());
        assertEquals(new ApiErrorDTO("BAD_REQUEST", "Os dados enviados são inválidos."), resposta.getBody());
        assertFalse(resposta.getBody().message().contains(erro.getMessage()));
    }

    static Stream<RuntimeException> errosDeEntrada() {
        return Stream.of(new IllegalArgumentException("Detalhe interno A"),
                new IllegalStateException("Detalhe interno B"));
    }

    @Test
    @DisplayName("Recurso ausente não revela o detalhe interno da exceção")
    void ocultaDetalhesDeRecursoAusente() {
        var resposta = handler.handleNotFound(new EntityNotFoundException("Tabela interna de teste"));

        assertEquals(HttpStatus.NOT_FOUND, resposta.getStatusCode());
        assertEquals(new ApiErrorDTO("NOT_FOUND", "O recurso solicitado não foi encontrado."), resposta.getBody());
    }
}
