package com.batutinhas.restaurante_pop.model;

import com.batutinhas.restaurante_pop.factory.RefeicaoFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** RF006: posições e operações do cardápio; duplicidade por ingredientes aprovada em PEND02. */
class SemanaTest {
    private final Semana semana = new Semana();

    @Test
    @DisplayName("Semana nova possui cinco posições vazias")
    void leCincoPosicoesVazias() {
        assertEquals(Collections.nCopies(5, null), semana.getCardapio());
    }

    @Test
    @DisplayName("Leitura usa a posição dos slots e ignora posições fora de segunda a sexta")
    void leSlotsForaDeOrdem() {
        var frango = refeicao("Frango");
        var peixe = refeicao("Peixe");
        semana.getCardapioSlots().add(new SemanaRefeicao(semana, 3, peixe));
        semana.getCardapioSlots().add(new SemanaRefeicao(semana, -1, frango));
        semana.getCardapioSlots().add(new SemanaRefeicao(semana, 1, frango));
        semana.getCardapioSlots().add(new SemanaRefeicao(semana, 5, peixe));

        assertEquals(Arrays.asList(null, frango, null, peixe, null), semana.getCardapio());
    }

    @Test
    @DisplayName("Entrada nula cria cinco slots vazios associados à semana")
    void defineCardapioNulo() {
        semana.setCardapio(null);

        assertEquals(Collections.nCopies(5, null), semana.getCardapio());
        assertEquals(5, semana.getCardapioSlots().size());
        for (int posicao = 0; posicao < 5; posicao++) {
            var slot = semana.getCardapioSlots().get(posicao);
            assertSame(semana, slot.getSemana());
            assertEquals(posicao, slot.getPosicao());
        }
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 4, 6})
    @DisplayName("Definição de cardápio rejeita tamanhos diferentes de cinco")
    void rejeitaTamanhoInvalido(int tamanho) {
        assertThrows(IllegalArgumentException.class,
                () -> semana.setCardapio(new ArrayList<>(Collections.nCopies(tamanho, null))));

        assertTrue(semana.getCardapioSlots().isEmpty());
    }

    @Test
    @DisplayName("Substituição reaproveita slots válidos, preserva lacunas e remove posições inválidas")
    void substituiSlotsSemCrescer() {
        semana.setCardapio(null);
        var primeiroSlot = semana.getCardapioSlots().getFirst();
        semana.getCardapioSlots().add(new SemanaRefeicao(semana, -1, refeicao("Inválida")));
        semana.getCardapioSlots().add(new SemanaRefeicao(semana, 5, refeicao("Inválida")));
        var peixe = refeicao("Peixe");
        var cardapio = Arrays.asList(null, null, peixe, null, null);

        semana.setCardapio(cardapio);
        semana.setCardapio(cardapio);

        assertEquals(cardapio, semana.getCardapio());
        assertEquals(5, semana.getCardapioSlots().size());
        assertSame(primeiroSlot, semana.getCardapioSlots().getFirst());
        assertTrue(semana.getCardapioSlots().stream().allMatch(slot -> slot.getSemana() == semana));
    }

    @Test
    @DisplayName("Adição ocupa a primeira lacuna sem deslocar refeições existentes")
    void adicionaNaPrimeiraPosicaoLivre() {
        var frango = refeicao("Frango");
        var peixe = refeicao("Peixe");
        var carne = refeicao("Carne");
        semana.setCardapio(Arrays.asList(frango, null, peixe, null, null));

        semana.addRefeicao(carne);

        assertEquals(Arrays.asList(frango, carne, peixe, null, null), semana.getCardapio());
    }

    @Test
    @DisplayName("Adição de refeição nula é rejeitada sem alterar o cardápio")
    void rejeitaAdicaoNula() {
        assertThrows(IllegalArgumentException.class, () -> semana.addRefeicao(null));

        assertEquals(Collections.nCopies(5, null), semana.getCardapio());
    }

    @Test
    @DisplayName("Adição de refeição igual é rejeitada sem ocupar outra posição")
    void rejeitaAdicaoDuplicada() {
        semana.addRefeicao(refeicao("Frango"));

        assertThrows(IllegalArgumentException.class, () -> semana.addRefeicao(refeicao("Frango")));

        assertNull(semana.getCardapio().get(1));
    }

    @Test
    @DisplayName("Ingredientes iguais continuam duplicados quando só as calorias mudam")
    void rejeitaMesmosIngredientesComCaloriasDiferentes() {
        semana.addRefeicao(refeicao("Frango"));
        var duplicada = refeicao("Frango");
        duplicada.setCalorias(700);

        assertThrows(IllegalArgumentException.class, () -> semana.addRefeicao(duplicada));

        assertNull(semana.getCardapio().get(1));
    }

    @Test
    @DisplayName("Semana cheia rejeita uma sexta refeição")
    void rejeitaSemanaCheia() {
        var cardapio = List.of(refeicao("A"), refeicao("B"), refeicao("C"), refeicao("D"), refeicao("E"));
        semana.setCardapio(cardapio);

        assertThrows(IllegalStateException.class, () -> semana.addRefeicao(refeicao("F")));

        assertEquals(cardapio, semana.getCardapio());
    }

    @Test
    @DisplayName("Remoção limpa somente a posição correspondente sem deslocar dias")
    void removeSemDeslocar() {
        var frango = refeicao("Frango");
        var peixe = refeicao("Peixe");
        semana.setCardapio(Arrays.asList(null, frango, null, peixe, null));

        semana.removeRefeicao(frango);

        assertEquals(Arrays.asList(null, null, null, peixe, null), semana.getCardapio());
    }

    @Test
    @DisplayName("Remoção de refeição ausente preserva o cardápio")
    void removeAusenteSemAlterar() {
        var frango = refeicao("Frango");
        var cardapio = Arrays.asList(null, frango, null, null, null);
        semana.setCardapio(cardapio);

        semana.removeRefeicao(refeicao("Peixe"));

        assertEquals(cardapio, semana.getCardapio());
    }

    private static Refeicao refeicao(String proteina) {
        var refeicao = RefeicaoFactory.criarRefeicaoEntidadeValida();
        refeicao.setProteina(proteina);
        return refeicao;
    }
}
