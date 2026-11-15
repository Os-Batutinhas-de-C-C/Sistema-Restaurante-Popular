package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.UsuarioCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.UsuarioResponseDTO;
import com.batutinhas.restaurante_pop.exception.PerfilException;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF007 / DTO RN03 e RN08: valida cadastro e mapeamento sem banco, com encoder e repository simulados. */
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock private UsuarioRepository repository;
    @Mock private PasswordEncoder encoder;
    private UsuarioService service;

    @BeforeEach
    void preparar() {
        service = new UsuarioService(repository, encoder);
    }

    @Test
    @DisplayName("Cadastro associa a credencial, grava hash e devolve o ID gerado")
    void cadastraComHashEAssociacaoCompleta() {
        var base = UsuarioFactory.criarUsuarioCreateRequestDTO();
        var request = new UsuarioCreateRequestDTO(base.nome(), " " + base.emailRecuperacao() + " ", base.tipo(), "curta");
        when(repository.findByEmailRecuperacao(base.emailRecuperacao())).thenReturn(Optional.empty());
        when(encoder.encode("curta")).thenReturn("hash-ficticio");
        when(repository.saveAndFlush(any(Usuario.class))).thenAnswer(invocacao -> {
            Usuario salvo = invocacao.getArgument(0);
            ReflectionTestUtils.setField(salvo, "id_usuario", 42L);
            return salvo;
        });
        LocalDate antes = LocalDate.now();

        var resposta = service.registrarUsuario(request);

        var captura = ArgumentCaptor.forClass(Usuario.class);
        verify(repository).saveAndFlush(captura.capture());
        Usuario salvo = captura.getValue();
        var credencial = salvo.getCredencialAutenticacao();
        assertSame(salvo, credencial.getUsuario());
        assertEquals("hash-ficticio", credencial.getPasswordHash());
        assertEquals(0, credencial.getTentativasFalhas());
        assertEquals(0, credencial.getVersaoToken());
        assertFalse(credencial.getDataCriacao().isBefore(antes));
        assertFalse(credencial.getDataCriacao().isAfter(LocalDate.now()));
        assertEquals(new UsuarioResponseDTO(42, base.nome(), base.emailRecuperacao(), base.tipo()), resposta);
        verify(repository).findByEmailRecuperacao(base.emailRecuperacao());
        verify(encoder).encode("curta"); // Cadastro não herda o mínimo de seis caracteres da troca de senha.
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cadastrosInvalidos")
    @DisplayName("Dados inválidos não consultam, codificam nem salvam a conta")
    void rejeitaCadastroInvalido(String motivo, UsuarioCreateRequestDTO request) {
        assertThrows(IllegalArgumentException.class, () -> service.registrarUsuario(request));

        verifyNoInteractions(repository, encoder);
    }

    static Stream<Arguments> cadastrosInvalidos() {
        var base = UsuarioFactory.criarUsuarioCreateRequestDTO();
        Stream<Arguments> obrigatorios = Stream.of((String) null, "", " \t").flatMap(valor -> Stream.of(
                Arguments.of("nome obrigatório: " + valor, new UsuarioCreateRequestDTO(valor, base.emailRecuperacao(), base.tipo(), base.senhaPura())),
                Arguments.of("e-mail obrigatório: " + valor, new UsuarioCreateRequestDTO(base.nome(), valor, base.tipo(), base.senhaPura())),
                Arguments.of("senha obrigatória: " + valor, new UsuarioCreateRequestDTO(base.nome(), base.emailRecuperacao(), base.tipo(), valor))));
        Stream<Arguments> estrutura = Stream.of(Arguments.of("request nulo", null),
                Arguments.of("tipo nulo", new UsuarioCreateRequestDTO(base.nome(), base.emailRecuperacao(), null, base.senhaPura())));
        Stream<Arguments> limites = Stream.of("a".repeat(256), "😀".repeat(128)).flatMap(valor -> Stream.of(
                Arguments.of("nome com 256 unidades UTF-16", new UsuarioCreateRequestDTO(valor, base.emailRecuperacao(), base.tipo(), base.senhaPura())),
                Arguments.of("e-mail com 256 unidades UTF-16", new UsuarioCreateRequestDTO(base.nome(), valor, base.tipo(), base.senhaPura()))));
        return Stream.concat(Stream.concat(estrutura, obrigatorios), limites);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("textosNoLimite")
    @DisplayName("Nome e e-mail aceitam exatamente 255 unidades UTF-16")
    void aceitaTextosNoLimite(String descricao, String nome, String email) {
        var request = new UsuarioCreateRequestDTO(nome, email, 'C', "senha123");
        when(repository.findByEmailRecuperacao(email)).thenReturn(Optional.empty());
        when(encoder.encode("senha123")).thenReturn("hash-ficticio");
        when(repository.saveAndFlush(any(Usuario.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        var resposta = service.registrarUsuario(request);

        assertEquals(nome, resposta.nome());
        assertEquals(email, resposta.emailRecuperacao());
        verify(repository).saveAndFlush(any(Usuario.class));
    }

    static Stream<Arguments> textosNoLimite() {
        return Stream.of(Arguments.of("ASCII", "a".repeat(255), "a".repeat(248) + "@x.test"),
                Arguments.of("suplementares", "😀".repeat(127) + "a", "😀".repeat(124) + "@x.test"));
    }

    @Test
    @DisplayName("Duplicata conhecida é rejeitada antes de codificar ou salvar")
    void rejeitaEmailJaCadastrado() {
        var request = UsuarioFactory.criarUsuarioCreateRequestDTO();
        when(repository.findByEmailRecuperacao(request.emailRecuperacao()))
                .thenReturn(Optional.of(UsuarioFactory.criarUsuarioEntidadeValido()));

        PerfilException erro = assertThrows(PerfilException.class, () -> service.registrarUsuario(request));

        assertConflitoEmail(erro);
        verifyNoInteractions(encoder);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Colisão na gravação também devolve conflito de e-mail")
    void traduzConflitoNoFlush() {
        var request = UsuarioFactory.criarUsuarioCreateRequestDTO();
        when(repository.findByEmailRecuperacao(request.emailRecuperacao())).thenReturn(Optional.empty());
        when(encoder.encode(request.senhaPura())).thenReturn("hash-ficticio");
        when(repository.saveAndFlush(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("detalhe interno"));

        PerfilException erro = assertThrows(PerfilException.class, () -> service.registrarUsuario(request));

        assertConflitoEmail(erro); // O mock não comprova rollback nem unicidade real do banco.
    }

    @Test
    @DisplayName("Listagem sem contas retorna coleção vazia")
    void listaVazia() {
        when(repository.findAll()).thenReturn(List.of());

        assertEquals(List.of(), service.listarUsuarios());

        verifyNoInteractions(encoder);
    }

    @Test
    @DisplayName("Listagem preserva ordem e mapeia somente os campos públicos")
    void listaUsuariosComoDtos() {
        var primeiro = UsuarioFactory.criarUsuarioEntidadeValido("um@example.test", 'N');
        var segundo = UsuarioFactory.criarUsuarioEntidadeValido("dois@example.test", 'C');
        ReflectionTestUtils.setField(primeiro, "id_usuario", 1L);
        ReflectionTestUtils.setField(segundo, "id_usuario", 2L);
        when(repository.findAll()).thenReturn(List.of(primeiro, segundo));

        var resposta = service.listarUsuarios();

        assertEquals(List.of(new UsuarioResponseDTO(1, primeiro.getNome(), primeiro.getEmailRecuperacao(), 'N'),
                new UsuarioResponseDTO(2, segundo.getNome(), segundo.getEmailRecuperacao(), 'C')), resposta);
        verifyNoInteractions(encoder);
    }

    private void assertConflitoEmail(PerfilException erro) {
        assertEquals(HttpStatus.CONFLICT, erro.getStatus());
        assertEquals("EMAIL_IN_USE", erro.getCode());
        assertEquals("Este e-mail já está em uso.", erro.getMessage());
    }
}
