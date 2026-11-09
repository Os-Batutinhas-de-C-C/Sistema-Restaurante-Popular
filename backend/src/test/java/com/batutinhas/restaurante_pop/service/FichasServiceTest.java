package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.FichasDiaResponseDTO;
import com.batutinhas.restaurante_pop.exception.FichasException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** RF003: coordenação diária e repetição da criação; RN11 do contrato DTO. */
class FichasServiceTest {
    private static final LocalDate SEGUNDA = LocalDate.of(2026, 11, 2);
    private static final LocalDate TERCA = SEGUNDA.plusDays(1);
    private final FichasTransacaoService transacoes = mock(FichasTransacaoService.class);

    @ParameterizedTest(name = "{0} corresponde ao dia útil {1}")
    @CsvSource({
            "2026-11-02T03:00:00Z, 2026-11-02",
            "2026-11-04T02:59:59Z, 2026-11-03",
            "2026-11-04T03:00:00Z, 2026-11-04",
            "2026-11-05T15:00:00Z, 2026-11-05",
            "2026-11-07T02:59:59Z, 2026-11-06",
            "2026-11-09T03:00:00Z, 2026-11-09"
    })
    @DisplayName("Consulta e incremento usam Fortaleza mesmo com relógio em outra zona")
    void usaDataLocalNosDiasUteis(String instante, LocalDate dia) {
        var esperado = FichasTransacaoService.resposta(dia, 1);
        when(transacoes.consultar(dia)).thenReturn(esperado);
        when(transacoes.incrementar(dia)).thenReturn(Optional.of(esperado));
        var service = noInstante(instante);

        assertSame(esperado, service.consultarHoje());
        assertSame(esperado, service.incrementarHoje());
        verify(transacoes).consultar(dia);
        verify(transacoes).incrementar(dia);
        verifyNoMoreInteractions(transacoes);
    }

    @ParameterizedTest(name = "{0} corresponde ao dia fechado {1}")
    @CsvSource({
            "2026-11-07T03:00:00Z, 2026-11-07",
            "2026-11-08T15:00:00Z, 2026-11-08",
            "2026-11-09T02:59:59Z, 2026-11-08"
    })
    @DisplayName("Fim de semana retorna zero e rejeita entrega sem chamar transações")
    void fechaFimDeSemana(String instante, LocalDate dia) {
        var service = noInstante(instante);

        assertEquals(new FichasDiaResponseDTO(dia, 0, 300, 300, false), service.consultarHoje());
        var erro = assertThrows(FichasException.class, service::incrementarHoje);

        assertEquals("FICHAS_CLOSED_DAY", erro.getCode());
        verifyNoInteractions(transacoes);
    }

    @Test
    @DisplayName("Semana existente retorna o primeiro incremento sem criar outra semana")
    void retornaPrimeiroIncremento() {
        var resposta = FichasTransacaoService.resposta(TERCA, 42);
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.of(resposta));

        assertSame(resposta, naTerca().incrementarHoje());

        verify(transacoes).incrementar(TERCA);
        verifyNoMoreInteractions(transacoes);
    }

    @Test
    @DisplayName("Semana ausente é criada na segunda-feira e recebe uma nova tentativa")
    void criaSemanaAntesDeRepetir() {
        var resposta = FichasTransacaoService.resposta(TERCA, 1);
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.empty(), Optional.of(resposta));

        assertSame(resposta, naTerca().incrementarHoje());

        var ordem = inOrder(transacoes);
        ordem.verify(transacoes).incrementar(TERCA);
        ordem.verify(transacoes).criarSemanaVazia(SEGUNDA);
        ordem.verify(transacoes).incrementar(TERCA);
        ordem.verifyNoMoreInteractions();
    }

    @Test
    @DisplayName("Colisão na criação permite uma segunda tentativa bem-sucedida")
    void repeteAposColisao() {
        var resposta = FichasTransacaoService.resposta(TERCA, 2);
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.empty(), Optional.of(resposta));
        doThrow(new DataIntegrityViolationException("colisão fictícia"))
                .when(transacoes).criarSemanaVazia(SEGUNDA);

        assertSame(resposta, naTerca().incrementarHoje());

        verify(transacoes, times(2)).incrementar(TERCA);
        verify(transacoes).criarSemanaVazia(SEGUNDA);
        verifyNoMoreInteractions(transacoes);
    }

    @Test
    @DisplayName("Colisão é relançada quando a segunda tentativa também não encontra a semana")
    void preservaColisaoOriginal() {
        var colisao = new DataIntegrityViolationException("colisão fictícia");
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.empty());
        doThrow(colisao).when(transacoes).criarSemanaVazia(SEGUNDA);

        assertSame(colisao, assertThrows(DataIntegrityViolationException.class, naTerca()::incrementarHoje));

        verify(transacoes, times(2)).incrementar(TERCA);
        verify(transacoes).criarSemanaVazia(SEGUNDA);
        verifyNoMoreInteractions(transacoes);
    }

    @Test
    @DisplayName("Criação sem semana disponível termina após a segunda tentativa")
    void falhaQuandoSemanaCriadaNaoAparece() {
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, naTerca()::incrementarHoje);

        verify(transacoes, times(2)).incrementar(TERCA);
        verify(transacoes).criarSemanaVazia(SEGUNDA);
        verifyNoMoreInteractions(transacoes);
    }

    @Test
    @DisplayName("Erro no primeiro incremento não tenta criar semana")
    void propagaErroDoPrimeiroIncremento() {
        var falha = new IllegalStateException("falha fictícia");
        when(transacoes.incrementar(TERCA)).thenThrow(falha);

        assertSame(falha, assertThrows(IllegalStateException.class, naTerca()::incrementarHoje));

        verify(transacoes).incrementar(TERCA);
        verifyNoMoreInteractions(transacoes);
    }

    @Test
    @DisplayName("Erro de criação diferente de colisão não repete o incremento")
    void propagaOutroErroDeCriacao() {
        var falha = new IllegalStateException("falha fictícia");
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.empty());
        doThrow(falha).when(transacoes).criarSemanaVazia(SEGUNDA);

        assertSame(falha, assertThrows(IllegalStateException.class, naTerca()::incrementarHoje));

        verify(transacoes).incrementar(TERCA);
        verify(transacoes).criarSemanaVazia(SEGUNDA);
        verifyNoMoreInteractions(transacoes);
    }

    @Test
    @DisplayName("Erro da segunda tentativa é propagado sem nova repetição")
    void propagaErroDaSegundaTentativa() {
        var falha = new IllegalStateException("falha fictícia");
        when(transacoes.incrementar(TERCA)).thenReturn(Optional.empty()).thenThrow(falha);

        assertSame(falha, assertThrows(IllegalStateException.class, naTerca()::incrementarHoje));

        verify(transacoes, times(2)).incrementar(TERCA);
        verify(transacoes).criarSemanaVazia(SEGUNDA);
        verifyNoMoreInteractions(transacoes);
    }

    private FichasService naTerca() {
        return noInstante("2026-11-03T15:00:00Z");
    }

    private FichasService noInstante(String instante) {
        return new FichasService(transacoes, Clock.fixed(Instant.parse(instante), ZoneId.of("Asia/Tokyo")));
    }
}
