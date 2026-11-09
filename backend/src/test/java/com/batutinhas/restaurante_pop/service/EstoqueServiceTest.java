package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.EstoqueCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueResponseDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueUpdateRequestDTO;
import com.batutinhas.restaurante_pop.factory.EstoqueFactory;
import com.batutinhas.restaurante_pop.model.Estoque;
import com.batutinhas.restaurante_pop.repository.EstoqueRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.MockedStatic;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF010: protege os campos do estoque e as fronteiras de validade em Fortaleza. */
@DisplayName("Estoque: conversão, atualização e validade")
class EstoqueServiceTest {
    private static final ZoneId FORTALEZA = ZoneId.of("America/Fortaleza");
    private final EstoqueRepository estoques = mock(EstoqueRepository.class);
    private final EstoqueService service = new EstoqueService(estoques);

    @ParameterizedTest
    @MethodSource("validades")
    @DisplayName("Status considera validade nula, ontem, hoje e a fronteira inclusiva de sete dias")
    void calculaStatusDeValidade(Integer diasAteValidade, String status) {
        LocalDate hoje = LocalDate.of(2026, 11, 9);
        Estoque estoque = EstoqueFactory.criarEstoqueEntidadeValido();
        estoque.setDataDeValidade(diasAteValidade == null ? null : hoje.plusDays(diasAteValidade));
        when(estoques.findAll()).thenReturn(List.of(estoque));

        try (MockedStatic<LocalDate> datas = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            datas.when(() -> LocalDate.now(FORTALEZA)).thenReturn(hoje);

            assertEquals(status, service.findAll().getFirst().status());
        }
        verify(estoques, never()).save(any());
    }

    static Stream<Arguments> validades() {
        return Stream.of(Arguments.of(null, "No prazo"), Arguments.of(-1, "Vencido"),
                Arguments.of(0, "Vence em breve"), Arguments.of(7, "Vence em breve"),
                Arguments.of(8, "No prazo"));
    }

    @ParameterizedTest
    @MethodSource("instantesNaVirada")
    @DisplayName("Validade vence somente depois da meia-noite de Fortaleza, às 03:00 UTC")
    void calculaStatusNaViradaDeFortaleza(String instante, String status) {
        Clock relogio = Clock.fixed(Instant.parse(instante), FORTALEZA);
        Estoque estoque = EstoqueFactory.criarEstoqueEntidadeValido();
        estoque.setDataDeValidade(LocalDate.of(2026, 11, 8));
        when(estoques.findAll()).thenReturn(List.of(estoque));

        try (MockedStatic<Clock> relogios = mockStatic(Clock.class, CALLS_REAL_METHODS)) {
            relogios.when(() -> Clock.system(FORTALEZA)).thenReturn(relogio);

            assertEquals(status, service.findAll().getFirst().status());
        }
    }

    static Stream<Arguments> instantesNaVirada() {
        return Stream.of(Arguments.of("2026-11-09T02:59:59.999999999Z", "Vence em breve"),
                Arguments.of("2026-11-09T03:00:00Z", "Vencido"));
    }

    @Test
    @DisplayName("Criação converte todos os campos e preserva quantidade fracionária")
    void criaEstoqueComTodosOsCampos() {
        var base = EstoqueFactory.criarEstoqueCreateRequestDTO();
        var request = new EstoqueCreateRequestDTO(base.nome(), 12.5, base.unidade(), base.lote(),
                base.dataDeRecebimento(), base.dataDeValidade(), base.observacoes());
        LocalDate hoje = LocalDate.of(2026, 11, 9);
        when(estoques.save(any(Estoque.class))).thenAnswer(invocacao -> {
            Estoque estoque = invocacao.getArgument(0);
            ReflectionTestUtils.setField(estoque, "id_material", 42L);
            return estoque;
        });

        try (MockedStatic<LocalDate> datas = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            datas.when(() -> LocalDate.now(FORTALEZA)).thenReturn(hoje);

            assertEquals(new EstoqueResponseDTO(42L, request.nome(), 12.5, request.unidade(), request.lote(),
                    request.dataDeRecebimento(), request.dataDeValidade(), request.observacoes(), "No prazo"),
                    service.create(request));
        }
        verify(estoques).save(any(Estoque.class));
    }

    @Test
    @DisplayName("Campos opcionais nulos são preservados e quantidade ausente vira zero")
    void criaComCamposOpcionaisNulos() {
        var request = new EstoqueCreateRequestDTO(null, null, null, null, null, null, null);
        when(estoques.save(any(Estoque.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        assertEquals(new EstoqueResponseDTO(0L, null, 0.0, null, null, null, null, null, "No prazo"),
                service.create(request));
    }

    @Test
    @DisplayName("Nome vazio continua aceito conforme o contrato atual")
    void aceitaNomeVazio() {
        var request = comTextos("", "kg", "Lote", "Observação");
        when(estoques.save(any(Estoque.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        assertEquals("", service.create(request).nome());
    }

    @Test
    @DisplayName("Todos os textos do estoque aceitam exatamente 255 unidades UTF-16")
    void aceitaTextosNoLimite() {
        String limite = "a".repeat(255);
        var request = comTextos(limite, limite, limite, limite);
        when(estoques.save(any(Estoque.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        var resposta = service.create(request);

        assertEquals(limite, resposta.nome());
        assertEquals(limite, resposta.unidade());
        assertEquals(limite, resposta.lote());
        assertEquals(limite, resposta.observacoes());
    }

    @ParameterizedTest
    @MethodSource("textosExcedidos")
    @DisplayName("Criação rejeita cada texto de 256 unidades UTF-16 sem salvar")
    void rejeitaTextoExcedidoNaCriacao(EstoqueCreateRequestDTO request) {
        assertThrows(IllegalArgumentException.class, () -> service.create(request));

        verifyNoInteractions(estoques);
    }

    @ParameterizedTest
    @MethodSource("textosExcedidos")
    @DisplayName("Atualização rejeita cada texto excedido sem chamar save")
    void rejeitaTextoExcedidoNaAtualizacao(EstoqueCreateRequestDTO request) {
        when(estoques.findById(42L)).thenReturn(Optional.of(EstoqueFactory.criarEstoqueEntidadeValido()));

        assertThrows(IllegalArgumentException.class, () -> service.update(42L, atualizacaoDe(request)));

        verify(estoques, never()).save(any());
    }

    static Stream<Arguments> textosExcedidos() {
        String longo = "a".repeat(256);
        return Stream.of(Arguments.of(comTextos(longo, "kg", "Lote", "Obs")),
                Arguments.of(comTextos("Arroz", longo, "Lote", "Obs")),
                Arguments.of(comTextos("Arroz", "kg", longo, "Obs")),
                Arguments.of(comTextos("Arroz", "kg", "Lote", longo)));
    }

    @Test
    @DisplayName("Atualização substitui todos os campos, mantém o ID e recalcula validade")
    void atualizaEstoqueEStatus() {
        Estoque estoque = EstoqueFactory.criarEstoqueEntidadeValido();
        ReflectionTestUtils.setField(estoque, "id_material", 42L);
        LocalDate hoje = LocalDate.of(2026, 11, 9);
        var request = new EstoqueUpdateRequestDTO("Feijão", 2.5, "g", "Novo lote",
                hoje.minusDays(2), hoje.minusDays(1), "Nova observação");
        when(estoques.findById(42L)).thenReturn(Optional.of(estoque));
        when(estoques.save(estoque)).thenReturn(estoque);

        try (MockedStatic<LocalDate> datas = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            datas.when(() -> LocalDate.now(FORTALEZA)).thenReturn(hoje);

            var resposta = service.update(42L, request).orElseThrow();

            assertEquals(new EstoqueResponseDTO(42L, request.nome(), 2.5, request.unidade(), request.lote(),
                    request.dataDeRecebimento(), request.dataDeValidade(), request.observacoes(), "Vencido"), resposta);
        }
        verify(estoques).save(estoque);
    }

    @Test
    @DisplayName("Atualização permite limpar os campos opcionais e zerar quantidade ausente")
    void atualizaComCamposNulos() {
        Estoque estoque = EstoqueFactory.criarEstoqueEntidadeValido();
        when(estoques.findById(42L)).thenReturn(Optional.of(estoque));
        when(estoques.save(estoque)).thenReturn(estoque);

        var resposta = service.update(42L, new EstoqueUpdateRequestDTO(null, null, null, null, null, null, null));

        assertEquals(Optional.of(new EstoqueResponseDTO(0L, null, 0.0, null, null, null, null, null, "No prazo")), resposta);
    }

    @Test
    @DisplayName("Atualização de ID ausente retorna vazio sem salvar")
    void naoAtualizaEstoqueAusente() {
        when(estoques.findById(42L)).thenReturn(Optional.empty());

        assertTrue(service.update(42L, atualizacaoDe(EstoqueFactory.criarEstoqueCreateRequestDTO())).isEmpty());

        verify(estoques, never()).save(any());
    }

    @Test
    @DisplayName("Listagem sem estoque retorna coleção vazia")
    void listaVazia() {
        when(estoques.findAll()).thenReturn(List.of());

        assertTrue(service.findAll().isEmpty());
    }

    @Test
    @DisplayName("Exclusão existente remove pelo identificador correto")
    void excluiEstoqueExistente() {
        when(estoques.existsById(42L)).thenReturn(true);

        assertTrue(service.delete(42L));

        verify(estoques).deleteById(42L);
    }

    @Test
    @DisplayName("Exclusão inexistente não remove registros")
    void naoExcluiEstoqueAusente() {
        when(estoques.existsById(42L)).thenReturn(false);

        assertFalse(service.delete(42L));

        verify(estoques, never()).deleteById(any());
    }

    private static EstoqueCreateRequestDTO comTextos(String nome, String unidade, String lote, String observacoes) {
        return new EstoqueCreateRequestDTO(nome, 10.0, unidade, lote, null, null, observacoes);
    }

    private static EstoqueUpdateRequestDTO atualizacaoDe(EstoqueCreateRequestDTO request) {
        return new EstoqueUpdateRequestDTO(request.nome(), request.quantidade(), request.unidade(), request.lote(),
                request.dataDeRecebimento(), request.dataDeValidade(), request.observacoes());
    }
}
