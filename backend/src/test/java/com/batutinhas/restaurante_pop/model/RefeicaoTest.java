package com.batutinhas.restaurante_pop.model;

import com.batutinhas.restaurante_pop.factory.RefeicaoFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/** RF006: igualdade por ingredientes; política confirmada pelo usuário para PEND02. */
class RefeicaoTest {
    @Test
    @DisplayName("Mesma composição é igual e produz o mesmo hash")
    void comparaComposicoesIguais() {
        var primeira = RefeicaoFactory.criarRefeicaoEntidadeValida();
        var segunda = RefeicaoFactory.criarRefeicaoEntidadeValida();

        assertEquals(primeira, segunda);
        assertEquals(segunda, primeira);
        assertEquals(primeira.hashCode(), segunda.hashCode());
    }

    @Test
    @DisplayName("Igualdade aceita a própria instância e rejeita nulo ou outro tipo")
    void respeitaTipoEIdentidade() {
        var refeicao = RefeicaoFactory.criarRefeicaoEntidadeValida();

        assertEquals(refeicao, refeicao);
        assertNotEquals(refeicao, null);
        assertNotEquals(refeicao, "Frango");
    }

    @ParameterizedTest(name = "alterar {0} muda a composição")
    @CsvSource({"proteína, proteina", "guarnição, guarnicao", "acompanhamento 1, acompanhamento1",
            "acompanhamento 2, acompanhamento2", "suco, suco", "sobremesa, sobremesa",
            "opção proteica, opcao_proteica", "salada, salada_do_dia"})
    @DisplayName("Cada ingrediente participa da igualdade")
    void diferenciaCadaIngrediente(String descricao, String campo) {
        var primeira = RefeicaoFactory.criarRefeicaoEntidadeValida();
        var segunda = RefeicaoFactory.criarRefeicaoEntidadeValida();
        ReflectionTestUtils.setField(segunda, campo, "Ingrediente diferente");

        assertNotEquals(primeira, segunda);
    }

    @Test
    @DisplayName("IDs diferentes não distinguem refeições da mesma composição")
    void ignoraIdentificador() {
        var primeira = RefeicaoFactory.criarRefeicaoEntidadeValida();
        var segunda = RefeicaoFactory.criarRefeicaoEntidadeValida();
        ReflectionTestUtils.setField(primeira, "id_refeicao", 1L);
        ReflectionTestUtils.setField(segunda, "id_refeicao", 2L);

        assertEquals(primeira, segunda);
        assertEquals(primeira.hashCode(), segunda.hashCode());
    }

    @Test
    @DisplayName("Calorias diferentes não alteram a igualdade nem o hash dos mesmos ingredientes")
    void ignoraCaloriasNaDuplicidade() {
        var primeira = RefeicaoFactory.criarRefeicaoEntidadeValida();
        var segunda = RefeicaoFactory.criarRefeicaoEntidadeValida();
        segunda.setCalorias(700);

        assertAll(
                () -> assertEquals(primeira, segunda),
                () -> assertEquals(primeira.hashCode(), segunda.hashCode())
        );
    }
}
