package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.CardapioPublicoResponseDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoRequestDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoResponseDTO;
import com.batutinhas.restaurante_pop.dto.SemanaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.SemanaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.factory.RefeicaoFactory;
import com.batutinhas.restaurante_pop.factory.SemanaFactory;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import jakarta.persistence.EntityNotFoundException;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF005: posições semanais, referências e proteção das fichas; RN07/RN11 do contrato DTO. */
class SemanaServiceTest {
    private static final LocalDate SEGUNDA = LocalDate.of(2026, 11, 2);
    private final SemanaRepository repository = mock(SemanaRepository.class);
    private final RefeicaoRepository refeicoes = mock(RefeicaoRepository.class);
    private final SemanaService service = new SemanaService(repository, refeicoes);

    @ParameterizedTest
    @MethodSource("datasInvalidas")
    @DisplayName("Criação e atualização rejeitam data nula ou diferente de segunda antes de consultar")
    void rejeitaDataInvalida(LocalDate data) {
        var request = new SemanaCreateRequestDTO(data, null, null, null);

        assertThrows(IllegalArgumentException.class, () -> service.create(request));
        assertThrows(IllegalArgumentException.class,
                () -> service.update(data, new SemanaUpdateRequestDTO(null, null, null)));

        verifyNoInteractions(repository, refeicoes);
    }

    @Test
    @DisplayName("Segunda-feira já cadastrada não é criada novamente")
    void rejeitaDataDuplicada() {
        when(repository.findByData(SEGUNDA)).thenReturn(Optional.of(SemanaFactory.criarSemanaValida()));

        assertThrows(IllegalArgumentException.class, () -> service.create(criacao(null, null)));

        verify(repository, never()).save(any());
        verifyNoInteractions(refeicoes);
    }

    @Test
    @DisplayName("Atualização de semana ausente retorna vazio sem salvar")
    void atualizaSemanaAusente() {
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.empty());

        assertTrue(service.update(SEGUNDA, new SemanaUpdateRequestDTO(null, null, null)).isEmpty());

        verify(repository).findByDataForUpdate(SEGUNDA);
        verifyNoMoreInteractions(repository);
        verifyNoInteractions(refeicoes);
    }

    @Test
    @DisplayName("Cardápio e desperdício nulos viram cinco lacunas e lista vazia")
    void normalizaListasNulas() {
        aceitaSalvar();

        var resposta = service.create(criacao(null, List.of(300, 300, 300, 300, 300)));

        assertEquals(SEGUNDA, resposta.data());
        assertEquals(Collections.nCopies(5, null), resposta.cardapio());
        assertTrue(resposta.desperdicio().isEmpty());
        assertTrue(resposta.fichasVendidas().isEmpty());
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 4, 6})
    @DisplayName("Cardápio não nulo exige exatamente cinco posições")
    void rejeitaTamanhoInvalido(int tamanho) {
        var cardapio = new ArrayList<RefeicaoRequestDTO>(Collections.nCopies(tamanho, null));

        assertThrows(IllegalArgumentException.class, () -> service.create(criacao(cardapio, null)));

        verify(repository, never()).save(any());
        verifyNoInteractions(refeicoes);
    }

    @Test
    @DisplayName("Atualização com cardápio de tamanho inválido não salva")
    void rejeitaCardapioInvalidoNaAtualizacao() {
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.of(SemanaFactory.criarSemanaValida()));

        assertThrows(IllegalArgumentException.class,
                () -> service.update(SEGUNDA, new SemanaUpdateRequestDTO(null, null, List.of())));

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Desperdício recebido é copiado antes de persistir a semana")
    void copiaDesperdicioRecebido() {
        aceitaSalvar();
        var desperdicio = new ArrayList<>(Arrays.asList(1.5, null, 2.5));
        var captor = org.mockito.ArgumentCaptor.forClass(Semana.class);

        service.create(new SemanaCreateRequestDTO(SEGUNDA, desperdicio, null, null));
        desperdicio.set(0, 99.0);

        verify(repository).save(captor.capture());
        assertEquals(Arrays.asList(1.5, null, 2.5), captor.getValue().getDesperdicio());
    }

    @ParameterizedTest
    @MethodSource("fichasRecebidas")
    @DisplayName("Criação ignora qualquer valor de fichas enviado pelo cliente")
    void criacaoIgnoraFichas(List<Integer> recebidas) {
        aceitaSalvar();

        assertTrue(service.create(criacao(null, recebidas)).fichasVendidas().isEmpty());
    }

    @ParameterizedTest
    @MethodSource("fichasRecebidas")
    @DisplayName("Atualização consulta para bloqueio e preserva as fichas persistidas")
    void atualizacaoPreservaFichas(List<Integer> recebidas) {
        var semana = SemanaFactory.criarSemanaValida();
        semana.setFichasVendidas(new ArrayList<>(List.of(12, 23, 34, 45, 56)));
        when(repository.findByDataForUpdate(SEGUNDA)).thenReturn(Optional.of(semana));
        aceitaSalvar();

        var resposta = service.update(SEGUNDA, new SemanaUpdateRequestDTO(null, recebidas, null)).orElseThrow();

        assertEquals(List.of(12, 23, 34, 45, 56), resposta.fichasVendidas());
        assertEquals(List.of(12, 23, 34, 45, 56), semana.getFichasVendidas());
        assertTrue(resposta.desperdicio().isEmpty());
        verify(repository).findByDataForUpdate(SEGUNDA);
        verify(repository, never()).findByData(any());
    }

    @Test
    @DisplayName("Referência existente reutiliza a entidade na posição informada sem editá-la")
    void associaReferenciaExistente() {
        var refeicao = RefeicaoFactory.criarRefeicaoEntidadeValida();
        when(refeicoes.findById(7L)).thenReturn(Optional.of(refeicao));
        aceitaSalvar();

        var resposta = service.create(criacao(naPosicao(3, RefeicaoFactory.criarReferenciaDeRefeicao(7L)), null));

        var captor = org.mockito.ArgumentCaptor.forClass(Semana.class);
        verify(repository).save(captor.capture());
        assertSame(refeicao, captor.getValue().getCardapio().get(3));
        assertEquals("Frango", refeicao.getProteina());
        assertNull(resposta.cardapio().get(0));
        assertEquals("Frango", resposta.cardapio().get(3).proteina());
        verify(refeicoes).findById(7L);
        verifyNoMoreInteractions(refeicoes);
    }

    @Test
    @DisplayName("Referência ausente não salva o cardápio")
    void rejeitaReferenciaAusente() {
        when(refeicoes.findById(7L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.create(criacao(naPosicao(0, RefeicaoFactory.criarReferenciaDeRefeicao(7L)), null)));

        verify(repository, never()).save(any());
    }

    @ParameterizedTest(name = "ID combinado com {0}")
    @CsvSource({"proteina, 0", "guarnicao, 1", "acompanhamento1, 2", "acompanhamento2, 3",
            "suco, 4", "sobremesa, 5", "opcaoProteica, 6", "saladaDoDia, 7", "calorias, 8"})
    @DisplayName("ID não pode ser combinado com nenhum campo de criação, mesmo vazio ou zero")
    void rejeitaReferenciaComCampos(String campo, int indice) {
        var campos = new String[8];
        if (indice < 8) campos[indice] = "";
        var item = item(7L, campos, indice == 8 ? 0.0 : null);

        assertThrows(IllegalArgumentException.class, () -> service.create(criacao(naPosicao(0, item), null)));

        verify(repository, never()).save(any());
        verifyNoInteractions(refeicoes);
    }

    @Test
    @DisplayName("Criação inline mapeia todos os campos e preserva lacunas")
    void criaRefeicaoInline() {
        aceitaSalvar();
        var campos = new String[]{"Frango", "Farofa", "Arroz", "Feijão", "Caju", "Fruta", "Ovo", "Alface"};

        var resposta = service.create(criacao(naPosicao(2, item(null, campos, 650.0)), null));

        assertEquals(Arrays.asList(null, null,
                new RefeicaoResponseDTO(0, "Frango", "Farofa", "Arroz", "Feijão", "Caju", "Fruta", "Ovo", 650, "Alface"),
                null, null), resposta.cardapio());
        verifyNoInteractions(refeicoes);
    }

    @Test
    @DisplayName("Refeição inline aceita textos nulos e usa zero para calorias ausentes")
    void aceitaInlineNulo() {
        aceitaSalvar();

        var resposta = service.create(criacao(naPosicao(0, item(null, new String[8], null)), null));

        assertEquals(new RefeicaoResponseDTO(0, null, null, null, null, null, null, null, 0, null), resposta.cardapio().getFirst());
    }

    @ParameterizedTest(name = "{0}: aceita 255 e rejeita 256 unidades UTF-16")
    @CsvSource({"proteina, 0", "guarnicao, 1", "acompanhamento1, 2", "acompanhamento2, 3",
            "suco, 4", "sobremesa, 5", "opcaoProteica, 6", "saladaDoDia, 7"})
    @DisplayName("Cada campo inline respeita o limite de texto")
    void limitaTextoInline(String campo, int indice) {
        aceitaSalvar();
        var campos = new String[8];
        campos[indice] = "a".repeat(255);
        assertNotNull(service.create(criacao(naPosicao(0, item(null, campos, null)), null)));

        clearInvocations(repository);
        campos[indice] = "a".repeat(256);
        var erro = assertThrows(IllegalArgumentException.class,
                () -> service.create(criacao(naPosicao(0, item(null, campos, null)), null)));

        assertTrue(erro.getMessage().contains(campo));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Mesma composição e calorias não podem ocupar duas posições da semana")
    void rejeitaRefeicoesIguais() {
        var cardapio = naPosicao(0, RefeicaoFactory.criarRefeicaoRequestDTO());
        cardapio.set(3, RefeicaoFactory.criarRefeicaoRequestDTO());

        assertThrows(IllegalArgumentException.class, () -> service.create(criacao(cardapio, null)));

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Ingredientes iguais são duplicados na semana mesmo com calorias diferentes")
    void rejeitaMesmosIngredientesComCaloriasDiferentes() {
        aceitaSalvar();
        var base = RefeicaoFactory.criarRefeicaoRequestDTO();
        var cardapio = naPosicao(0, base);
        cardapio.set(3, new RefeicaoRequestDTO(null, base.proteina(), base.guarnicao(), base.acompanhamento1(),
                base.acompanhamento2(), base.suco(), base.sobremesa(), base.opcaoProteica(), 700.0, base.saladaDoDia()));

        assertThrows(IllegalArgumentException.class, () -> service.create(criacao(cardapio, null)));

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("IDs diferentes não permitem repetir a mesma composição na semana")
    void rejeitaMesmosIngredientesComIdsDiferentes() {
        var primeira = RefeicaoFactory.criarRefeicaoEntidadeValida();
        var segunda = RefeicaoFactory.criarRefeicaoEntidadeValida();
        ReflectionTestUtils.setField(primeira, "id_refeicao", 7L);
        ReflectionTestUtils.setField(segunda, "id_refeicao", 8L);
        when(refeicoes.findById(7L)).thenReturn(Optional.of(primeira));
        when(refeicoes.findById(8L)).thenReturn(Optional.of(segunda));
        var cardapio = naPosicao(0, RefeicaoFactory.criarReferenciaDeRefeicao(7L));
        cardapio.set(3, RefeicaoFactory.criarReferenciaDeRefeicao(8L));

        assertThrows(IllegalArgumentException.class, () -> service.create(criacao(cardapio, null)));

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Refeição existente pode ser reutilizada em semanas diferentes")
    void compartilhaReferenciaEntreSemanas() {
        var refeicao = RefeicaoFactory.criarRefeicaoEntidadeValida();
        when(refeicoes.findById(7L)).thenReturn(Optional.of(refeicao));
        aceitaSalvar();
        var cardapio = naPosicao(0, RefeicaoFactory.criarReferenciaDeRefeicao(7L));

        service.create(criacao(cardapio, null));
        service.create(new SemanaCreateRequestDTO(SEGUNDA.plusWeeks(1), null, null, cardapio));

        verify(repository, times(2)).save(any());
    }

    @Test
    @DisplayName("Listagem vazia permanece vazia para consulta administrativa e pública")
    void listaVazia() {
        when(repository.findAllByOrderByDataAsc()).thenReturn(List.of());

        assertTrue(service.findAll().isEmpty());
        assertTrue(service.findAllPublic().isEmpty());
    }

    @Test
    @DisplayName("Listagem preserva a sequência do repository e copia métricas sem deslocar posições")
    void listaComCopiasDasMetricas() {
        var primeira = SemanaFactory.criarSemanaValida();
        primeira.setDesperdicio(new ArrayList<>(Arrays.asList(1.0, null, 3.0)));
        primeira.setFichasVendidas(new ArrayList<>(Arrays.asList(12, null, 34)));
        var segunda = SemanaFactory.criarSemanaValida();
        segunda.setData(primeira.getData().plusWeeks(1));
        when(repository.findAllByOrderByDataAsc()).thenReturn(List.of(primeira, segunda));

        var resposta = service.findAll();

        assertEquals(List.of(primeira.getData(), segunda.getData()), resposta.stream().map(r -> r.data()).toList());
        assertEquals(Arrays.asList(1.0, null, 3.0), resposta.getFirst().desperdicio());
        assertEquals(Arrays.asList(12, null, 34), resposta.getFirst().fichasVendidas());
        assertEquals(5, resposta.getFirst().cardapio().size());
        primeira.getDesperdicio().set(0, 99.0);
        primeira.getFichasVendidas().set(0, 99);
        assertEquals(1.0, resposta.getFirst().desperdicio().getFirst());
        assertEquals(12, resposta.getFirst().fichasVendidas().getFirst());
        verify(repository).findAllByOrderByDataAsc();
    }

    @Test
    @DisplayName("Listagem converte métricas nulas em listas vazias")
    void listaMetricasNulas() {
        var semana = SemanaFactory.criarSemanaValida();
        semana.setDesperdicio(null);
        semana.setFichasVendidas(null);
        when(repository.findAllByOrderByDataAsc()).thenReturn(List.of(semana));

        var resposta = service.findAll().getFirst();

        assertTrue(resposta.desperdicio().isEmpty());
        assertTrue(resposta.fichasVendidas().isEmpty());
    }

    @Test
    @DisplayName("Listagem pública devolve somente datas e as cinco posições de refeições")
    void listaPublicaSemMetricas() {
        var semana = SemanaFactory.criarSemanaValida();
        when(repository.findAllByOrderByDataAsc()).thenReturn(List.of(semana));

        var resposta = service.findAllPublic().getFirst();

        assertEquals(semana.getData(), resposta.data());
        assertEquals("Frango", resposta.cardapio().getFirst().proteina());
        assertEquals(Arrays.asList(null, null, null, null), resposta.cardapio().subList(1, 5));
        assertEquals(List.of("data", "cardapio"), Arrays.stream(CardapioPublicoResponseDTO.class.getRecordComponents())
                .map(componente -> componente.getName()).toList());
    }

    private void aceitaSalvar() {
        when(repository.save(any(Semana.class))).thenAnswer(invocacao -> invocacao.getArgument(0));
    }

    private static SemanaCreateRequestDTO criacao(List<RefeicaoRequestDTO> cardapio, List<Integer> fichas) {
        return new SemanaCreateRequestDTO(SEGUNDA, null, fichas, cardapio);
    }

    private static List<RefeicaoRequestDTO> naPosicao(int posicao, RefeicaoRequestDTO refeicao) {
        var cardapio = new ArrayList<RefeicaoRequestDTO>(Collections.nCopies(5, null));
        cardapio.set(posicao, refeicao);
        return cardapio;
    }

    private static RefeicaoRequestDTO item(Long id, String[] campos, Double calorias) {
        return new RefeicaoRequestDTO(id, campos[0], campos[1], campos[2], campos[3], campos[4], campos[5],
                campos[6], calorias, campos[7]);
    }

    private static Stream<LocalDate> datasInvalidas() {
        return Stream.concat(Stream.of((LocalDate) null), Stream.iterate(SEGUNDA.plusDays(1), d -> d.plusDays(1)).limit(6));
    }

    private static Stream<List<Integer>> fichasRecebidas() {
        return Stream.of(null, List.of(), List.of(1), List.of(300, 300, 300, 300, 300));
    }
}
