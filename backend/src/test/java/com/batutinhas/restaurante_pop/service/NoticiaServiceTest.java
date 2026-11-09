package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.NoticiaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.NoticiaResponseDTO;
import com.batutinhas.restaurante_pop.factory.NoticiaFactory;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Noticia;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF008: protege publicação, autoria autenticada e limites do contrato de notícias. */
@DisplayName("Notícias: autoria, validação e conversão")
class NoticiaServiceTest {
    private final NoticiaRepository noticias = mock(NoticiaRepository.class);
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final NoticiaService service = new NoticiaService(noticias, usuarios);
    private final Usuario autor = UsuarioFactory.criarUsuarioEntidadeValido();

    @Test
    @DisplayName("Criação associa o autor autenticado e devolve todos os campos salvos")
    void criaNoticiaComAutorAutenticado() {
        var request = NoticiaFactory.criarNoticiaCreateRequestDTO();
        when(usuarios.findByEmailRecuperacao(autor.getEmailRecuperacao())).thenReturn(Optional.of(autor));
        when(noticias.save(any(Noticia.class))).thenAnswer(invocacao -> {
            Noticia noticia = invocacao.getArgument(0);
            assertSame(autor, noticia.getUsuario());
            ReflectionTestUtils.setField(noticia, "id_mensagem", 42L);
            return noticia;
        });

        NoticiaResponseDTO resposta = service.create(request, autor.getEmailRecuperacao());

        assertEquals(new NoticiaResponseDTO(42L, request.assunto(), request.texto(),
                request.horario(), request.data(), request.duracao()), resposta);
        verify(usuarios).findByEmailRecuperacao(autor.getEmailRecuperacao());
        verify(noticias).save(any(Noticia.class));
    }

    @ParameterizedTest
    @MethodSource("textosInvalidos")
    @DisplayName("Assunto e texto inválidos são rejeitados antes de consultar autor ou salvar")
    void rejeitaTextoInvalido(String assunto, String texto) {
        var request = new NoticiaCreateRequestDTO(assunto, texto, null, null, 24);

        assertThrows(IllegalArgumentException.class, () -> service.create(request, autor.getEmailRecuperacao()));

        verifyNoInteractions(usuarios, noticias);
    }

    static Stream<Arguments> textosInvalidos() {
        return Stream.of(null, "", " \t", "a".repeat(256))
                .flatMap(valor -> Stream.of(Arguments.of(valor, "Texto válido"), Arguments.of("Assunto válido", valor)));
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(ints = {-1, 0, 73})
    @DisplayName("Duração ausente ou fora de 1 a 72 horas não consulta nem grava")
    void rejeitaDuracaoInvalida(Integer duracao) {
        var request = new NoticiaCreateRequestDTO("Aviso", "Texto", null, null, duracao);

        assertThrows(IllegalArgumentException.class, () -> service.create(request, autor.getEmailRecuperacao()));

        verifyNoInteractions(usuarios, noticias);
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 72})
    @DisplayName("Limites de duração e de texto são aceitos com data e horário nulos")
    void aceitaLimitesEDataHoraOpcionais(int duracao) {
        var request = new NoticiaCreateRequestDTO("a".repeat(255), "t".repeat(255), null, null, duracao);
        when(usuarios.findByEmailRecuperacao(autor.getEmailRecuperacao())).thenReturn(Optional.of(autor));
        when(noticias.save(any(Noticia.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        var resposta = service.create(request, autor.getEmailRecuperacao());

        assertEquals(request.assunto(), resposta.assunto());
        assertEquals(request.texto(), resposta.texto());
        assertEquals(duracao, resposta.duracao());
        assertNull(resposta.data());
        assertNull(resposta.horario());
    }

    @Test
    @DisplayName("Autor autenticado inexistente impede a gravação")
    void rejeitaAutorAusente() {
        when(usuarios.findByEmailRecuperacao(autor.getEmailRecuperacao())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.create(
                NoticiaFactory.criarNoticiaCreateRequestDTO(), autor.getEmailRecuperacao()));

        verifyNoInteractions(noticias);
    }

    @Test
    @DisplayName("Falha de persistência é propagada sem repetir a publicação")
    void propagaFalhaAoSalvar() {
        var falha = new DataAccessResourceFailureException("Falha simulada");
        when(usuarios.findByEmailRecuperacao(autor.getEmailRecuperacao())).thenReturn(Optional.of(autor));
        when(noticias.save(any(Noticia.class))).thenThrow(falha);

        assertSame(falha, assertThrows(DataAccessResourceFailureException.class, () -> service.create(
                NoticiaFactory.criarNoticiaCreateRequestDTO(), autor.getEmailRecuperacao())));

        verify(noticias, times(1)).save(any(Noticia.class));
    }

    @Test
    @DisplayName("Listagem sem notícias retorna coleção vazia")
    void listaVazia() {
        when(noticias.findAll()).thenReturn(List.of());

        assertTrue(service.findAll().isEmpty());
    }

    @Test
    @DisplayName("Listagem converte os campos da notícia sem devolver o autor")
    void listaNoticias() {
        Noticia noticia = NoticiaFactory.criarNoticiaEntidadeValida(autor);
        ReflectionTestUtils.setField(noticia, "id_mensagem", 7L);
        when(noticias.findAll()).thenReturn(List.of(noticia));

        assertEquals(List.of(new NoticiaResponseDTO(7L, noticia.getAssunto(), noticia.getTexto(),
                noticia.getHorario(), noticia.getData(), noticia.getDuracao())), service.findAll());
    }

    @Test
    @DisplayName("Exclusão existente remove pelo identificador solicitado")
    void excluiNoticiaExistente() {
        when(noticias.existsById(7L)).thenReturn(true);

        assertTrue(service.delete(7L));

        verify(noticias).deleteById(7L);
    }

    @Test
    @DisplayName("Exclusão inexistente retorna falso sem remover registros")
    void naoExcluiNoticiaAusente() {
        when(noticias.existsById(7L)).thenReturn(false);

        assertFalse(service.delete(7L));

        verify(noticias, never()).deleteById(any());
    }
}
