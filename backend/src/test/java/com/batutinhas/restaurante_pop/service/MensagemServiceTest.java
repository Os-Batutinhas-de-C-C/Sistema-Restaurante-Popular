package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.MensagemCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.MensagemPublicaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.MensagemResponseDTO;
import com.batutinhas.restaurante_pop.dto.MensagemUpdateRequestDTO;
import com.batutinhas.restaurante_pop.factory.MensagemFactory;
import com.batutinhas.restaurante_pop.factory.NoticiaFactory;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Mensagem;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.MockedStatic;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF009: protege anonimato, vínculo do autor e separação entre mensagens e notícias. */
@DisplayName("Mensagens administrativas e públicas")
class MensagemServiceTest {
    private static final ZoneId FORTALEZA = ZoneId.of("America/Fortaleza");
    private final MensagemRepository mensagens = mock(MensagemRepository.class);
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final MensagemService service = new MensagemService(mensagens, usuarios);

    @Test
    @DisplayName("Listagem vazia retorna coleção vazia")
    void listaVazia() {
        when(mensagens.findAll()).thenReturn(List.of());

        assertTrue(service.findAll().isEmpty());
    }

    @Test
    @DisplayName("Listagem exclui notícias e representa autores apenas por identificador")
    void listaMensagensComESemAutor() {
        Usuario autor = autorComId();
        Mensagem assinada = MensagemFactory.criarMensagemEntidadeValida(autor);
        Mensagem anonima = MensagemFactory.criarMensagemEntidadeValida(null);
        ReflectionTestUtils.setField(assinada, "id_mensagem", 10L);
        ReflectionTestUtils.setField(anonima, "id_mensagem", 11L);
        when(mensagens.findAll()).thenReturn(List.of(assinada,
                NoticiaFactory.criarNoticiaEntidadeValida(autor), anonima));

        List<MensagemResponseDTO> resposta = service.findAll();

        assertEquals(List.of(respostaDe(assinada, 42L), respostaDe(anonima, null)), resposta);
    }

    @Test
    @DisplayName("Consulta de mensagem existente converte todos os campos")
    void consultaMensagemExistente() {
        Mensagem mensagem = MensagemFactory.criarMensagemEntidadeValida(autorComId());
        ReflectionTestUtils.setField(mensagem, "id_mensagem", 10L);
        when(mensagens.findById(10L)).thenReturn(Optional.of(mensagem));

        assertEquals(Optional.of(respostaDe(mensagem, 42L)), service.findById(10L));
    }

    @ParameterizedTest
    @MethodSource("mensagemAusenteOuNoticia")
    @DisplayName("Consulta não encontra identificador ausente nem notícia")
    void consultaAusenteOuNoticia(Optional<Mensagem> encontrada) {
        when(mensagens.findById(10L)).thenReturn(encontrada);

        assertTrue(service.findById(10L).isEmpty());
    }

    @Test
    @DisplayName("Criação administrativa associa os dois lados e mapeia os campos salvos")
    void criaMensagemAdministrativa() {
        Usuario autor = autorComId();
        var request = MensagemFactory.criarMensagemCreateRequestDTO();
        when(usuarios.findById(42L)).thenReturn(Optional.of(autor));
        when(mensagens.save(any(Mensagem.class))).thenAnswer(invocacao -> {
            Mensagem mensagem = invocacao.getArgument(0);
            assertSame(autor, mensagem.getUsuario());
            assertEquals(List.of(mensagem), autor.getMensagens());
            ReflectionTestUtils.setField(mensagem, "id_mensagem", 10L);
            return mensagem;
        });

        var resposta = service.create(42L, request).orElseThrow();

        assertEquals(new MensagemResponseDTO(10L, request.assunto(), request.texto(),
                request.horario(), request.data(), 42L), resposta);
        verify(mensagens).save(any(Mensagem.class));
    }

    @Test
    @DisplayName("Usuário inexistente não cria mensagem")
    void naoCriaParaUsuarioAusente() {
        when(usuarios.findById(42L)).thenReturn(Optional.empty());

        assertTrue(service.create(42L, MensagemFactory.criarMensagemCreateRequestDTO()).isEmpty());

        verifyNoInteractions(mensagens);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" \t", "\u2003"})
    @DisplayName("Criação administrativa rejeita texto obrigatório ausente ou branco")
    void rejeitaTextoAdministrativoAusente(String texto) {
        Usuario autor = autorComId();
        when(usuarios.findById(42L)).thenReturn(Optional.of(autor));
        var request = new MensagemCreateRequestDTO("Assunto", texto, null, null);

        assertThrows(IllegalArgumentException.class, () -> service.create(42L, request));

        assertTrue(autor.getMensagens().isEmpty());
        verifyNoInteractions(mensagens);
    }

    @ParameterizedTest
    @MethodSource("comprimentosAdministrativosInvalidos")
    @DisplayName("Criação administrativa rejeita assunto 256 ou texto 1001 antes de associar")
    void rejeitaComprimentoAdministrativo(String assunto, String texto) {
        Usuario autor = autorComId();
        when(usuarios.findById(42L)).thenReturn(Optional.of(autor));
        var request = new MensagemCreateRequestDTO(assunto, texto, null, null);

        assertThrows(IllegalArgumentException.class, () -> service.create(42L, request));

        assertTrue(autor.getMensagens().isEmpty());
        verifyNoInteractions(mensagens);
    }

    static Stream<Arguments> comprimentosAdministrativosInvalidos() {
        return Stream.of(Arguments.of("a".repeat(256), "Texto"),
                Arguments.of("Assunto", "t".repeat(1001)));
    }

    @ParameterizedTest
    @MethodSource("assuntosAdministrativosValidos")
    @DisplayName("Assunto opcional e texto de 1000 caracteres aceitam data e horário nulos")
    void aceitaCamposAdministrativosOpcionais(String assunto) {
        when(usuarios.findById(42L)).thenReturn(Optional.of(autorComId()));
        when(mensagens.save(any(Mensagem.class))).thenAnswer(invocacao -> invocacao.getArgument(0));
        var request = new MensagemCreateRequestDTO(assunto, "t".repeat(1000), null, null);

        var resposta = service.create(42L, request).orElseThrow();

        assertEquals(assunto, resposta.assunto());
        assertEquals(request.texto(), resposta.texto());
        assertNull(resposta.data());
        assertNull(resposta.horario());
    }

    static Stream<Arguments> assuntosAdministrativosValidos() {
        return Stream.of(Arguments.of((String) null), Arguments.of(""), Arguments.of("a".repeat(255)));
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 100})
    @DisplayName("Mensagem pública nos limites usa Fortaleza, remove nanos e mantém anonimato")
    void criaMensagemPublicaComTempoControlado(int tamanhoAssunto) {
        LocalDate data = LocalDate.of(2026, 11, 9);
        LocalTime horario = LocalTime.of(0, 0, 3, 987654321);
        Clock relogio = Clock.fixed(LocalDateTime.of(data, horario).atZone(FORTALEZA).toInstant(), FORTALEZA);
        var request = new MensagemPublicaCreateRequestDTO("a".repeat(tamanhoAssunto),
                "t".repeat(tamanhoAssunto == 1 ? 1 : 1000));
        when(mensagens.save(any(Mensagem.class))).thenAnswer(invocacao -> {
            Mensagem mensagem = invocacao.getArgument(0);
            assertNull(mensagem.getUsuario());
            ReflectionTestUtils.setField(mensagem, "id_mensagem", 10L);
            return mensagem;
        });

        try (MockedStatic<Clock> relogios = mockStatic(Clock.class, CALLS_REAL_METHODS)) {
            relogios.when(() -> Clock.system(FORTALEZA)).thenReturn(relogio);

            var resposta = service.createPublic(request);

            assertEquals(new MensagemResponseDTO(10L, request.assunto(), request.texto(),
                    horario.withNano(0), data, null), resposta);
        }
        verifyNoInteractions(usuarios);
    }

    @Test
    @DisplayName("Regressão aprovada: mensagem pública mantém data e horário do mesmo instante na meia-noite")
    void mantemDataEHorarioConsistentesNaMeiaNoite() {
        // O relógio atravessa a meia-noite entre leituras: a mensagem precisa de uma única fotografia temporal.
        Instant antes = Instant.parse("2026-11-09T02:59:59.999999999Z");
        Instant depois = Instant.parse("2026-11-09T03:00:00Z");
        List<LocalDateTime> instantesCoerentes = List.of(
                LocalDateTime.ofInstant(antes, FORTALEZA).withNano(0),
                LocalDateTime.ofInstant(depois, FORTALEZA).withNano(0));
        Clock relogio = mock(Clock.class);
        when(relogio.getZone()).thenReturn(FORTALEZA);
        when(relogio.instant()).thenReturn(antes, depois);
        when(mensagens.save(any(Mensagem.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        try (MockedStatic<Clock> relogios = mockStatic(Clock.class, CALLS_REAL_METHODS)) {
            relogios.when(() -> Clock.system(FORTALEZA)).thenReturn(relogio);

            var resposta = service.createPublic(new MensagemPublicaCreateRequestDTO("Assunto", "Texto"));

            LocalDateTime registrado = LocalDateTime.of(resposta.data(), resposta.horario());
            assertTrue(instantesCoerentes.contains(registrado),
                    "Data e horário devem representar um dos instantes completos; recebido: " + registrado);
        }
    }

    @ParameterizedTest
    @MethodSource("camposPublicosInvalidos")
    @DisplayName("Mensagem pública rejeita campos obrigatórios e comprimentos excedidos sem salvar")
    void rejeitaCamposPublicos(String assunto, String texto) {
        var request = new MensagemPublicaCreateRequestDTO(assunto, texto);

        assertThrows(IllegalArgumentException.class, () -> service.createPublic(request));

        verifyNoInteractions(mensagens, usuarios);
    }

    static Stream<Arguments> camposPublicosInvalidos() {
        Stream<Arguments> ausentes = Stream.of(null, "", " \t")
                .flatMap(valor -> Stream.of(Arguments.of(valor, "Texto"), Arguments.of("Assunto", valor)));
        return Stream.concat(ausentes, Stream.of(Arguments.of("a".repeat(101), "Texto"),
                Arguments.of("Assunto", "t".repeat(1001))));
    }

    @Test
    @DisplayName("Atualização modifica texto, data e horário sem mudar assunto nem autor")
    void atualizaMensagemComum() {
        Usuario autor = autorComId();
        Mensagem mensagem = MensagemFactory.criarMensagemEntidadeValida(autor);
        String assuntoOriginal = mensagem.getAssunto();
        ReflectionTestUtils.setField(mensagem, "id_mensagem", 10L);
        var request = new MensagemUpdateRequestDTO("Texto atualizado", LocalTime.of(12, 30), LocalDate.of(2026, 11, 9));
        when(mensagens.findById(10L)).thenReturn(Optional.of(mensagem));
        when(mensagens.save(mensagem)).thenReturn(mensagem);

        var resposta = service.update(10L, request).orElseThrow();

        assertEquals(new MensagemResponseDTO(10L, assuntoOriginal, request.texto(),
                request.horario(), request.data(), 42L), resposta);
        assertSame(autor, mensagem.getUsuario());
        verify(mensagens).save(mensagem);
    }

    @Test
    @DisplayName("Atualização aceita texto no limite e limpa data e horário opcionais")
    void atualizaComCamposOpcionaisNulos() {
        Mensagem mensagem = MensagemFactory.criarMensagemEntidadeValida(null);
        when(mensagens.findById(10L)).thenReturn(Optional.of(mensagem));
        when(mensagens.save(mensagem)).thenReturn(mensagem);

        var resposta = service.update(10L, new MensagemUpdateRequestDTO("t".repeat(1000), null, null)).orElseThrow();

        assertEquals("t".repeat(1000), resposta.texto());
        assertNull(resposta.data());
        assertNull(resposta.horario());
        assertNull(resposta.usuarioId());
    }

    @ParameterizedTest
    @MethodSource("textosDeAtualizacaoInvalidos")
    @DisplayName("Atualização inválida preserva a mensagem e não salva")
    void naoAlteraMensagemQuandoTextoInvalido(String texto) {
        Mensagem mensagem = MensagemFactory.criarMensagemEntidadeValida(autorComId());
        var original = respostaDe(mensagem, 42L);
        when(mensagens.findById(10L)).thenReturn(Optional.of(mensagem));

        assertThrows(IllegalArgumentException.class,
                () -> service.update(10L, new MensagemUpdateRequestDTO(texto, null, null)));

        assertEquals(original, respostaDe(mensagem, 42L));
        verify(mensagens, never()).save(any());
    }

    static Stream<Arguments> textosDeAtualizacaoInvalidos() {
        return Stream.of(Arguments.of((String) null), Arguments.of(""), Arguments.of(" \t"),
                Arguments.of("t".repeat(1001)));
    }

    @Test
    @DisplayName("Atualização de identificador ausente retorna vazio sem salvar")
    void naoAtualizaMensagemAusente() {
        when(mensagens.findById(10L)).thenReturn(Optional.empty());

        assertTrue(service.update(10L, new MensagemUpdateRequestDTO("Texto", null, null)).isEmpty());

        verify(mensagens, never()).save(any());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"Não deve ser aplicado"})
    @DisplayName("Regressão aprovada: atualização de mensagem rejeita ID de notícia sem alterar nem salvar")
    void naoAtualizaNoticiaPelaRotaDeMensagem(String texto) {
        Mensagem noticia = NoticiaFactory.criarNoticiaEntidadeValida(autorComId());
        MensagemResponseDTO original = respostaDe(noticia, 42L);
        when(mensagens.findById(10L)).thenReturn(Optional.of(noticia));
        when(mensagens.save(any(Mensagem.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        var resposta = service.update(10L, new MensagemUpdateRequestDTO(texto, null, null));

        assertAll(
                () -> assertTrue(resposta.isEmpty(), "ID de notícia deve ser tratado como mensagem inexistente."),
                () -> assertEquals(original, respostaDe(noticia, 42L), "A notícia deve permanecer intacta."),
                () -> verify(mensagens, never()).save(any()));
    }

    @Test
    @DisplayName("Exclusão remove exatamente a mensagem comum encontrada")
    void excluiMensagemComum() {
        Mensagem mensagem = MensagemFactory.criarMensagemEntidadeValida(null);
        when(mensagens.findById(10L)).thenReturn(Optional.of(mensagem));

        assertTrue(service.delete(10L));

        verify(mensagens).delete(mensagem);
    }

    @ParameterizedTest
    @MethodSource("mensagemAusenteOuNoticia")
    @DisplayName("Exclusão de identificador ausente ou notícia não remove registros")
    void naoExcluiMensagemAusenteOuNoticia(Optional<Mensagem> encontrada) {
        when(mensagens.findById(10L)).thenReturn(encontrada);

        assertFalse(service.delete(10L));

        verify(mensagens, never()).delete(any());
    }

    static Stream<Arguments> mensagemAusenteOuNoticia() {
        return Stream.of(Arguments.of(Optional.<Mensagem>empty()),
                Arguments.of(Optional.<Mensagem>of(NoticiaFactory.criarNoticiaEntidadeValida(null))));
    }

    private Usuario autorComId() {
        Usuario autor = UsuarioFactory.criarUsuarioEntidadeValido();
        ReflectionTestUtils.setField(autor, "id_usuario", 42L);
        return autor;
    }

    private MensagemResponseDTO respostaDe(Mensagem mensagem, Long usuarioId) {
        return new MensagemResponseDTO(mensagem.getIdMensagem(), mensagem.getAssunto(), mensagem.getTexto(),
                mensagem.getHorario(), mensagem.getData(), usuarioId);
    }
}
