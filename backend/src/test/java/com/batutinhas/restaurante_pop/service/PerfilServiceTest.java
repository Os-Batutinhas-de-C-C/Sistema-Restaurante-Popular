package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.PerfilUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.SenhaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.UsuarioResponseDTO;
import com.batutinhas.restaurante_pop.exception.PerfilException;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.function.Executable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF001 / DTO RN08–RN10: protege identidade e revogação com entidades reais e dependências simuladas. */
@ExtendWith(MockitoExtension.class)
class PerfilServiceTest {
    private static final long ID = 7;
    private static final long VERSAO = 3;
    private static final String EMAIL = "conta@example.test";
    private static final String NOVO_EMAIL = "nova@example.test";
    private static final String SENHA_ATUAL = "senha-atual";
    @Mock private UsuarioRepository repository;
    @Mock private PasswordEncoder encoder;
    private PerfilService service;
    private Usuario usuario;
    private String nomeOriginal;
    private String hashOriginal;

    @BeforeEach
    void preparar() {
        service = new PerfilService(repository, encoder);
        usuario = UsuarioFactory.criarUsuarioEntidadeValido(EMAIL, 'N');
        ReflectionTestUtils.setField(usuario, "id_usuario", ID);
        usuario.getCredencialAutenticacao().setVersaoToken(VERSAO);
        nomeOriginal = usuario.getNome();
        hashOriginal = usuario.getCredencialAutenticacao().getPasswordHash();
    }

    @Test
    @DisplayName("Consulta devolve somente os campos públicos da própria conta")
    void consultaPerfilExistente() {
        when(repository.findById(ID)).thenReturn(Optional.of(usuario));

        var resposta = service.consultar(ID);

        assertEquals(new UsuarioResponseDTO(ID, nomeOriginal, EMAIL, 'N'), resposta);
        verifyNoInteractions(encoder);
    }

    @Test
    @DisplayName("Consulta de conta inexistente gera erro de perfil não encontrado")
    void rejeitaConsultaAusente() {
        when(repository.findById(ID)).thenReturn(Optional.empty());

        assertErro(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", () -> service.consultar(ID));

        verify(repository, never()).saveAndFlush(any());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("perfisInvalidos")
    @DisplayName("Perfil inválido é rejeitado antes de buscar ou modificar a conta")
    void rejeitaPerfilInvalido(String motivo, PerfilUpdateRequestDTO request) {
        assertErro(HttpStatus.BAD_REQUEST, "PROFILE_VALIDATION_ERROR", () -> service.atualizar(ID, VERSAO, request));

        assertContaPreservada();
        verifyNoInteractions(repository, encoder);
    }

    static Stream<Arguments> perfisInvalidos() {
        return Stream.of(
                Arguments.of("request nulo", null),
                Arguments.of("nome nulo", perfil(null, EMAIL, null)),
                Arguments.of("nome vazio", perfil("", EMAIL, null)),
                Arguments.of("nome branco", perfil(" \t", EMAIL, null)),
                Arguments.of("e-mail nulo", perfil("Nome", null, null)),
                Arguments.of("e-mail vazio", perfil("Nome", "", null)),
                Arguments.of("e-mail branco", perfil("Nome", " \t", null)),
                Arguments.of("sem parte local", perfil("Nome", "@dominio", null)),
                Arguments.of("sem domínio", perfil("Nome", "local@", null)),
                Arguments.of("sem arroba", perfil("Nome", "invalido", null)),
                Arguments.of("espaço interno", perfil("Nome", "lo cal@dominio", null)),
                Arguments.of("arrobas extras", perfil("Nome", "local@@dominio", null)),
                Arguments.of("nome 256 ASCII", perfil("a".repeat(256), EMAIL, null)),
                Arguments.of("nome 256 suplementares", perfil("😀".repeat(256), EMAIL, null)),
                Arguments.of("e-mail 256 ASCII", perfil("Nome", "a".repeat(254) + "@x", null)),
                Arguments.of("e-mail 256 suplementares", perfil("Nome", "😀".repeat(254) + "@x", null)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"a", "😀"})
    @DisplayName("Trim aceita exatamente 255 pontos de código, inclusive suplementares")
    void aceitaLimiteUnicode(String caractere) {
        String nome = caractere.repeat(255);
        String email = caractere.repeat(253) + "@x";
        usuario.setEmailRecuperacao(email);
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));

        var resposta = service.atualizar(ID, VERSAO, perfil(" " + nome + " ", " " + email + " ", null));

        assertEquals(nome, resposta.usuario().nome());
        assertEquals(email, resposta.usuario().emailRecuperacao());
        assertFalse(resposta.requerNovoLogin());
        verifyNoInteractions(encoder);
    }

    @Test
    @DisplayName("Nome e e-mail igual após trim preservam a sessão e dispensam senha atual")
    void mudaSomenteNomeSemRevogarSessao() {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));

        var resposta = service.atualizar(ID, VERSAO, perfil(" Nome atualizado ", " " + EMAIL + " ", null));

        assertEquals(new UsuarioResponseDTO(ID, "Nome atualizado", EMAIL, 'N'), resposta.usuario());
        assertFalse(resposta.requerNovoLogin());
        assertEquals(hashOriginal, usuario.getCredencialAutenticacao().getPasswordHash());
        assertEquals(VERSAO, usuario.getCredencialAutenticacao().getVersaoToken());
        verifyNoInteractions(encoder);
        verify(repository, never()).findByEmailRecuperacao(any());
        verify(repository).saveAndFlush(usuario);
    }

    @ParameterizedTest
    @ValueSource(strings = {NOVO_EMAIL, "CONTA@example.test"})
    @DisplayName("Mudança de e-mail, inclusive só maiúsculas, exige senha e revoga uma versão")
    void alteraEmailComSenhaValida(String email) {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));
        when(encoder.matches(SENHA_ATUAL, hashOriginal)).thenReturn(true);
        when(repository.findByEmailRecuperacao(email)).thenReturn(Optional.empty());

        var resposta = service.atualizar(ID, VERSAO, perfil(nomeOriginal, email, SENHA_ATUAL));

        assertTrue(resposta.requerNovoLogin());
        assertEquals(email, resposta.usuario().emailRecuperacao());
        assertEquals(ID, resposta.usuario().idUsuario());
        assertEquals('N', resposta.usuario().tipo());
        assertEquals(hashOriginal, usuario.getCredencialAutenticacao().getPasswordHash());
        assertEquals(VERSAO + 1, usuario.getCredencialAutenticacao().getVersaoToken());
        verify(repository).saveAndFlush(usuario);
        verify(encoder, never()).encode(any());
    }

    @Test
    @DisplayName("Busca que retorna a própria conta não cria falso conflito de e-mail")
    void ignoraPropriaContaNaBuscaDeConflito() {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));
        when(encoder.matches(SENHA_ATUAL, hashOriginal)).thenReturn(true);
        when(repository.findByEmailRecuperacao(NOVO_EMAIL)).thenReturn(Optional.of(usuario));

        assertTrue(service.atualizar(ID, VERSAO, perfil(nomeOriginal, NOVO_EMAIL, SENHA_ATUAL)).requerNovoLogin());

        verify(repository).saveAndFlush(usuario);
    }

    @Test
    @DisplayName("E-mail de outra conta é rejeitado antes de alterar os dados")
    void rejeitaEmailEmUso() {
        Usuario outro = UsuarioFactory.criarUsuarioEntidadeValido(NOVO_EMAIL, 'C');
        ReflectionTestUtils.setField(outro, "id_usuario", ID + 1);
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));
        when(encoder.matches(SENHA_ATUAL, hashOriginal)).thenReturn(true);
        when(repository.findByEmailRecuperacao(NOVO_EMAIL)).thenReturn(Optional.of(outro));

        assertErro(HttpStatus.CONFLICT, "EMAIL_IN_USE",
                () -> service.atualizar(ID, VERSAO, perfil("Outro nome", NOVO_EMAIL, SENHA_ATUAL)));

        assertSemGravacaoNemCodificacao();
    }

    @ParameterizedTest(name = "{0}; troca de senha = {1}")
    @MethodSource("senhasAtuaisInvalidas")
    @DisplayName("Senha atual inválida preserva perfil e credenciais nas duas operações")
    void rejeitaSenhaAtualInvalida(String senha, boolean trocaSenha) {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));
        if ("incorreta".equals(senha)) when(encoder.matches(senha, hashOriginal)).thenReturn(false);

        assertErro(HttpStatus.BAD_REQUEST, "CURRENT_PASSWORD_INVALID", () -> {
            if (trocaSenha) service.alterarSenha(ID, VERSAO, new SenhaUpdateRequestDTO(senha, "nova123", "nova123"));
            else service.atualizar(ID, VERSAO, perfil("Outro nome", NOVO_EMAIL, senha));
        });

        assertSemGravacaoNemCodificacao();
        if (!"incorreta".equals(senha)) verifyNoInteractions(encoder);
        verify(repository, never()).findByEmailRecuperacao(any());
    }

    static Stream<Arguments> senhasAtuaisInvalidas() {
        return Stream.of((String) null, "", " \t", "a".repeat(73), "á".repeat(37), "incorreta")
                .flatMap(senha -> Stream.of(Arguments.of(senha, false), Arguments.of(senha, true)));
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    @DisplayName("Conta removida antes da atualização não é salva nem codificada")
    void rejeitaAtualizacaoDeContaAusente(boolean trocaSenha) {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.empty());

        assertErro(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", () -> atualizarOuTrocarSenha(trocaSenha));

        assertSemGravacaoNemCodificacao();
    }

    @ParameterizedTest(name = "credencial ausente = {0}; troca de senha = {1}")
    @MethodSource("sessoesRevogadas")
    @DisplayName("Conta bloqueada é revalidada antes de qualquer alteração")
    void rejeitaSessaoRevogada(boolean semCredencial, boolean trocaSenha) {
        if (semCredencial) usuario.setCredencialAutenticacao(null);
        else usuario.getCredencialAutenticacao().setVersaoToken(VERSAO + 1);
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));

        assertErro(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", () -> atualizarOuTrocarSenha(trocaSenha));

        assertEquals(nomeOriginal, usuario.getNome());
        assertEquals(EMAIL, usuario.getEmailRecuperacao());
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(encoder);
    }

    static Stream<Arguments> sessoesRevogadas() {
        return Stream.of(Arguments.of(false, false), Arguments.of(false, true),
                Arguments.of(true, false), Arguments.of(true, true));
    }

    @Test
    @DisplayName("Colisão no flush de perfil vira conflito sem afirmar rollback do mock")
    void traduzConflitoNaGravacao() {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));
        when(repository.saveAndFlush(usuario)).thenThrow(new DataIntegrityViolationException("detalhe interno"));

        assertErro(HttpStatus.CONFLICT, "EMAIL_IN_USE",
                () -> service.atualizar(ID, VERSAO, perfil("Novo nome", EMAIL, null)));

        verify(repository).saveAndFlush(usuario);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("trocasInvalidas")
    @DisplayName("Nova senha e confirmação inválidas são rejeitadas antes de buscar a conta")
    void rejeitaNovaSenhaInvalida(String motivo, SenhaUpdateRequestDTO request) {
        assertErro(HttpStatus.BAD_REQUEST, "PROFILE_VALIDATION_ERROR", () -> service.alterarSenha(ID, VERSAO, request));

        assertContaPreservada();
        verifyNoInteractions(repository, encoder);
    }

    static Stream<Arguments> trocasInvalidas() {
        return Stream.of(Arguments.of("request nulo", null),
                Arguments.of("senha nula", new SenhaUpdateRequestDTO(SENHA_ATUAL, null, null)),
                Arguments.of("senha vazia", new SenhaUpdateRequestDTO(SENHA_ATUAL, "", "")),
                Arguments.of("senha branca", new SenhaUpdateRequestDTO(SENHA_ATUAL, "      ", "      ")),
                Arguments.of("cinco ASCII", new SenhaUpdateRequestDTO(SENHA_ATUAL, "12345", "12345")),
                Arguments.of("cinco suplementares", new SenhaUpdateRequestDTO(SENHA_ATUAL, "😀".repeat(5), "😀".repeat(5))),
                Arguments.of("73 bytes", new SenhaUpdateRequestDTO(SENHA_ATUAL, "a".repeat(73), "a".repeat(73))),
                Arguments.of("74 bytes multibyte", new SenhaUpdateRequestDTO(SENHA_ATUAL, "á".repeat(37), "á".repeat(37))),
                Arguments.of("confirmação nula", new SenhaUpdateRequestDTO(SENHA_ATUAL, "nova123", null)),
                Arguments.of("confirmação diferente", new SenhaUpdateRequestDTO(SENHA_ATUAL, "nova123", "outra123")));
    }

    @ParameterizedTest
    @MethodSource("senhasNovasValidas")
    @DisplayName("Troca válida aceita fronteiras Unicode e UTF-8, grava hash e revoga uma versão")
    void alteraSenhaValida(String novaSenha) {
        when(repository.findForProfileUpdate(ID)).thenReturn(Optional.of(usuario));
        when(encoder.matches(SENHA_ATUAL, hashOriginal)).thenReturn(true);
        when(encoder.encode(novaSenha)).thenReturn("hash-novo-ficticio");

        service.alterarSenha(ID, VERSAO, new SenhaUpdateRequestDTO(SENHA_ATUAL, novaSenha, novaSenha));

        assertEquals("hash-novo-ficticio", usuario.getCredencialAutenticacao().getPasswordHash());
        assertEquals(VERSAO + 1, usuario.getCredencialAutenticacao().getVersaoToken());
        assertEquals(nomeOriginal, usuario.getNome());
        assertEquals(EMAIL, usuario.getEmailRecuperacao());
        assertEquals('N', usuario.getTipo());
        verify(encoder).encode(novaSenha);
        verify(repository).saveAndFlush(usuario);
    }

    static Stream<String> senhasNovasValidas() {
        return Stream.of("123456", "😀".repeat(6), "a".repeat(72), "á".repeat(36), "😀".repeat(18));
    }

    private static PerfilUpdateRequestDTO perfil(String nome, String email, String senha) {
        return new PerfilUpdateRequestDTO(nome, email, senha);
    }

    private void atualizarOuTrocarSenha(boolean trocaSenha) {
        if (trocaSenha) service.alterarSenha(ID, VERSAO, new SenhaUpdateRequestDTO(SENHA_ATUAL, "nova123", "nova123"));
        else service.atualizar(ID, VERSAO, perfil("Outro nome", NOVO_EMAIL, SENHA_ATUAL));
    }

    private void assertErro(HttpStatus status, String codigo, Executable operacao) {
        PerfilException erro = assertThrows(PerfilException.class, operacao);
        assertEquals(status, erro.getStatus());
        assertEquals(codigo, erro.getCode());
    }

    private void assertContaPreservada() {
        assertEquals(nomeOriginal, usuario.getNome());
        assertEquals(EMAIL, usuario.getEmailRecuperacao());
        assertEquals(ID, usuario.getIdUsuario());
        assertEquals('N', usuario.getTipo());
        assertEquals(hashOriginal, usuario.getCredencialAutenticacao().getPasswordHash());
        assertEquals(VERSAO, usuario.getCredencialAutenticacao().getVersaoToken());
    }

    private void assertSemGravacaoNemCodificacao() {
        assertContaPreservada();
        verify(repository, never()).saveAndFlush(any());
        verify(encoder, never()).encode(any());
    }
}
