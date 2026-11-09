package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.FichasDiaResponseDTO;
import com.batutinhas.restaurante_pop.exception.FichasException;
import com.batutinhas.restaurante_pop.factory.SemanaFactory;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF004: capacidade e preservação em memória; não comprova transações ou bloqueios reais. */
class FichasTransacaoServiceTest {
    private static final LocalDate SEGUNDA = LocalDate.of(2026, 11, 2);
    private static final LocalDate QUARTA = SEGUNDA.plusDays(2);
    private final SemanaRepository repository = mock(SemanaRepository.class);
    private final EntityManager entityManager = mock(EntityManager.class);
    private final FichasTransacaoService service = criarService();

    @Test
    @DisplayName("Consulta sem semana limpa o contexto e retorna zero sem gravar")
    void consultaSemanaAusente() {
        when(repository.findByData(SEGUNDA)).thenReturn(Optional.empty());

        assertEquals(new FichasDiaResponseDTO(QUARTA, 0, 300, 300, true), service.consultar(QUARTA));

        var ordem = inOrder(entityManager, repository);
        ordem.verify(entityManager).clear();
        ordem.verify(repository).findByData(SEGUNDA);
        ordem.verifyNoMoreInteractions();
    }

    @ParameterizedTest(name = "posição {0} contém {1} fichas")
    @CsvSource({"0, 11", "1, 22", "2, 33", "3, 44", "4, 55"})
    @DisplayName("Consulta preserva a posição de cada dia útil")
    void consultaPosicaoCorreta(int posicao, int entregues) {
        var semana = comFichas(List.of(11, 22, 33, 44, 55));
        when(repository.findByData(SEGUNDA)).thenReturn(Optional.of(semana));
        var dia = SEGUNDA.plusDays(posicao);

        assertEquals(new FichasDiaResponseDTO(dia, entregues, 300, 300 - entregues, true), service.consultar(dia));

        verify(repository).findByData(SEGUNDA);
        verifyNoMoreInteractions(repository);
    }

    @ParameterizedTest
    @MethodSource("contagensIncompletas")
    @DisplayName("Lista nula, curta ou com posição nula é consultada como zero")
    void consultaDadosIncompletos(List<Integer> fichas) {
        when(repository.findByData(SEGUNDA)).thenReturn(Optional.of(comFichas(fichas)));

        assertEquals(0, service.consultar(QUARTA).entregues());

        verify(repository).findByData(SEGUNDA);
        verifyNoMoreInteractions(repository);
    }

    @Test
    @DisplayName("Incremento sem semana limpa o contexto e retorna vazio")
    void incrementaSemanaAusente() {
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.empty());

        assertTrue(service.incrementar(QUARTA).isEmpty());

        var ordem = inOrder(entityManager, repository);
        ordem.verify(entityManager).clear();
        ordem.verify(repository).findByDataForUpdate(SEGUNDA);
        ordem.verifyNoMoreInteractions();
    }

    @ParameterizedTest
    @MethodSource("contagensIncompletas")
    @DisplayName("Incremento completa listas incompletas com zeros até a posição do dia")
    void incrementaDadosIncompletos(List<Integer> fichas) {
        var semana = comFichas(fichas);
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.of(semana));

        var resposta = service.incrementar(QUARTA).orElseThrow();

        assertEquals(List.of(0, 0, 1), semana.getFichasVendidas());
        assertEquals(new FichasDiaResponseDTO(QUARTA, 1, 300, 299, true), resposta);
        verify(repository).findByDataForUpdate(SEGUNDA);
        verifyNoMoreInteractions(repository);
    }

    @ParameterizedTest(name = "{0} fichas passam a {1}")
    @CsvSource({"0, 1, 299, true", "298, 299, 1, true", "299, 300, 0, false"})
    @DisplayName("Incremento soma exatamente um até a capacidade")
    void incrementaAteCapacidade(int antes, int depois, int restantes, boolean permite) {
        var semana = comFichas(List.of(12, 23, antes, 45, 56));
        var desperdicio = new ArrayList<>(semana.getDesperdicio());
        var cardapio = semana.getCardapio();
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.of(semana));

        assertEquals(new FichasDiaResponseDTO(QUARTA, depois, 300, restantes, permite),
                service.incrementar(QUARTA).orElseThrow());

        assertEquals(List.of(12, 23, depois, 45, 56), semana.getFichasVendidas());
        assertEquals(desperdicio, semana.getDesperdicio());
        assertEquals(cardapio, semana.getCardapio());
        var ordem = inOrder(entityManager, repository);
        ordem.verify(entityManager).clear();
        ordem.verify(repository).findByDataForUpdate(SEGUNDA);
        ordem.verifyNoMoreInteractions();
    }

    @ParameterizedTest
    @ValueSource(ints = {300, 301})
    @DisplayName("Contagem no limite ou acima dele não é incrementada")
    void rejeitaLimite(int contagem) {
        var semana = comFichas(List.of(12, 23, contagem, 45, 56));
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.of(semana));

        var erro = assertThrows(FichasException.class, () -> service.incrementar(QUARTA));

        assertEquals("FICHAS_LIMIT_REACHED", erro.getCode());
        assertEquals(List.of(12, 23, contagem, 45, 56), semana.getFichasVendidas());
        verify(repository, never()).save(any());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Leitura de contagem negativa rejeita dado legado inválido")
    void rejeitaConsultaNegativa() {
        when(repository.findByData(SEGUNDA)).thenReturn(Optional.of(comFichas(List.of(0, 0, -1))));

        var erro = assertThrows(FichasException.class, () -> service.consultar(QUARTA));

        assertEquals("FICHAS_INVALID_DATA", erro.getCode());
        verify(repository).findByData(SEGUNDA);
        verifyNoMoreInteractions(repository);
    }

    @Test
    @DisplayName("Incremento de contagem negativa rejeita sem alterar a lista")
    void rejeitaIncrementoNegativo() {
        var semana = comFichas(List.of(0, 0, -1));
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.of(semana));

        var erro = assertThrows(FichasException.class, () -> service.incrementar(QUARTA));

        assertEquals("FICHAS_INVALID_DATA", erro.getCode());
        assertEquals(List.of(0, 0, -1), semana.getFichasVendidas());
        verify(repository).findByDataForUpdate(SEGUNDA);
        verifyNoMoreInteractions(repository);
    }

    @Test
    @DisplayName("Consulta acima da capacidade preserva o total e retorna zero restantes")
    void consultaAcimaDaCapacidade() {
        when(repository.findByData(SEGUNDA)).thenReturn(Optional.of(comFichas(List.of(0, 0, 301))));

        assertEquals(new FichasDiaResponseDTO(QUARTA, 301, 300, 0, false), service.consultar(QUARTA));
    }

    @Test
    @DisplayName("Criação inicial salva com flush uma semana sem refeições ou entregas")
    void criaSemanaVazia() {
        var captor = org.mockito.ArgumentCaptor.forClass(Semana.class);

        service.criarSemanaVazia(SEGUNDA);

        verify(repository).saveAndFlush(captor.capture());
        var semana = captor.getValue();
        assertEquals(SEGUNDA, semana.getData());
        assertEquals(Arrays.asList(null, null, null, null, null), semana.getCardapio());
        assertTrue(semana.getFichasVendidas().isEmpty());
        assertTrue(semana.getDesperdicio().isEmpty());
        verifyNoMoreInteractions(repository);
    }

    private FichasTransacaoService criarService() {
        var unidade = new FichasTransacaoService(repository);
        ReflectionTestUtils.setField(unidade, "entityManager", entityManager);
        return unidade;
    }

    private static Semana comFichas(List<Integer> fichas) {
        var semana = SemanaFactory.criarSemanaValida();
        semana.setData(SEGUNDA);
        semana.setFichasVendidas(fichas == null ? null : new ArrayList<>(fichas));
        return semana;
    }

    private static Stream<List<Integer>> contagensIncompletas() {
        return Stream.of(null, List.of(), List.of(0), Arrays.asList(0, 0, null));
    }
}
