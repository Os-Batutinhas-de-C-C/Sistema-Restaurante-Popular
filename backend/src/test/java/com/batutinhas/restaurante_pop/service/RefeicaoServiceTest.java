package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.RefeicaoCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoResponseDTO;
import com.batutinhas.restaurante_pop.factory.RefeicaoFactory;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF006: criação, validação e mapeamento de refeições; contrato DTO de refeições. */
class RefeicaoServiceTest {
    private final RefeicaoRepository repository = mock(RefeicaoRepository.class);
    private final RefeicaoService service = new RefeicaoService(repository);

    @Test
    @DisplayName("Listagem sem refeições retorna uma lista vazia")
    void listaVazia() {
        when(repository.findAll()).thenReturn(List.of());

        assertTrue(service.findAll().isEmpty());
    }

    @Test
    @DisplayName("Listagem mapeia todos os campos, incluindo ID e salada")
    void listaTodosOsCampos() {
        var refeicao = RefeicaoFactory.criarRefeicaoEntidadeValida();
        refeicao.setSaladaDoDia("Alface");
        ReflectionTestUtils.setField(refeicao, "id_refeicao", 17L);
        when(repository.findAll()).thenReturn(List.of(refeicao));

        assertEquals(List.of(resposta(17L, camposValidos(), 450)), service.findAll());
    }

    @Test
    @DisplayName("Criação salva e devolve todos os campos sem vínculo obrigatório a semana")
    void criaTodosOsCampos() {
        aceitaSalvar();
        var campos = camposValidos();

        var retorno = service.create(request(campos, 450.0));

        assertEquals(resposta(0, campos, 450), retorno);
        var captor = org.mockito.ArgumentCaptor.forClass(Refeicao.class);
        verify(repository).save(captor.capture());
        assertEquals("Alface", captor.getValue().getSaladaDoDia());
        assertEquals(450, captor.getValue().getCalorias());
    }

    @Test
    @DisplayName("Textos opcionais nulos são aceitos e calorias nulas viram zero")
    void aceitaCamposNulos() {
        aceitaSalvar();
        var campos = new String[8];

        assertEquals(resposta(0, campos, 0), service.create(request(campos, null)));
    }

    @ParameterizedTest(name = "{0}: aceita 255 e rejeita 256 unidades UTF-16")
    @CsvSource({"proteina, 0", "guarnicao, 1", "acompanhamento1, 2", "acompanhamento2, 3",
            "suco, 4", "sobremesa, 5", "opcaoProteica, 6", "saladaDoDia, 7"})
    @DisplayName("Cada texto de refeição respeita o limite de 255")
    void validaLimiteDeCadaCampo(String campo, int indice) {
        aceitaSalvar();
        var campos = camposValidos();
        campos[indice] = "a".repeat(255);

        assertEquals(resposta(0, campos, 450), service.create(request(campos, 450.0)));

        clearInvocations(repository);
        campos[indice] = "a".repeat(256);
        var erro = assertThrows(IllegalArgumentException.class, () -> service.create(request(campos, 450.0)));
        assertTrue(erro.getMessage().contains(campo));
        verify(repository, never()).save(any());
    }

    private void aceitaSalvar() {
        when(repository.save(any(Refeicao.class))).thenAnswer(invocacao -> invocacao.getArgument(0));
    }

    private static String[] camposValidos() {
        var base = RefeicaoFactory.criarRefeicaoCreateRequestDTO();
        return new String[]{base.proteina(), base.guarnicao(), base.acompanhamento1(), base.acompanhamento2(),
                base.suco(), base.sobremesa(), base.opcaoProteica(), "Alface"};
    }

    private static RefeicaoCreateRequestDTO request(String[] campos, Double calorias) {
        return new RefeicaoCreateRequestDTO(campos[0], campos[1], campos[2], campos[3], campos[4], campos[5],
                campos[6], calorias, campos[7]);
    }

    private static RefeicaoResponseDTO resposta(long id, String[] campos, double calorias) {
        return new RefeicaoResponseDTO(id, campos[0], campos[1], campos[2], campos[3], campos[4], campos[5],
                campos[6], calorias, campos[7]);
    }
}
