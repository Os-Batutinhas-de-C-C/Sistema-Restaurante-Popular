package com.batutinhas.restaurante_pop.config;

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
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** RF002: claims inválidos e contas indisponíveis nunca autorizam; o repository é sempre simulado. */
@ExtendWith(MockitoExtension.class)
class JwtTokenVersionValidatorTest {
    private static final String EMAIL = "conta@example.test";
    @Mock private UsuarioRepository repository;
    private JwtTokenVersionValidator validator;
    private Usuario usuario;

    @BeforeEach
    void preparar() {
        validator = new JwtTokenVersionValidator(repository);
        usuario = UsuarioFactory.criarUsuarioEntidadeValido(EMAIL, 'N');
    }

    @ParameterizedTest
    @MethodSource("numerosInteiros")
    @DisplayName("Representações numéricas inteiras exatas identificam a conta e a versão")
    void aceitaClaimsInteiros(Number id, Number versao) {
        ReflectionTestUtils.setField(usuario, "id_usuario", id.longValue());
        usuario.getCredencialAutenticacao().setVersaoToken(versao.longValue());
        when(repository.findById(id.longValue())).thenReturn(Optional.of(usuario));

        var resultado = validator.validate(token(id, versao, EMAIL));

        assertFalse(resultado.hasErrors());
        verify(repository).findById(id.longValue());
    }

    static Stream<Arguments> numerosInteiros() {
        return Stream.of(Arguments.of(1, 0), Arguments.of(1L, 0L),
                Arguments.of(BigInteger.ONE, BigInteger.ZERO),
                Arguments.of(new BigDecimal("1.0"), new BigDecimal("0.00")), Arguments.of(1.0, 0.0),
                Arguments.of(7L, 3L), Arguments.of(Long.MAX_VALUE, Long.MAX_VALUE));
    }

    @ParameterizedTest(name = "{0}: {1}")
    @MethodSource("claimsInvalidos")
    @DisplayName("Claim malformado é rejeitado antes da consulta ao banco")
    void rejeitaClaimsInvalidos(String campo, Object valor) {
        Map<String, Object> claims = claimsValidos();
        claims.put(campo, valor);

        assertInvalido(validator.validate(token(claims)));

        verifyNoInteractions(repository);
    }

    static Stream<Arguments> claimsInvalidos() {
        Stream<Arguments> numeros = Stream.of("userId", "tokenVersion").flatMap(campo ->
                Stream.of(null, "1", true, -1, new BigDecimal("0.5"),
                                new BigInteger("9223372036854775808"), new BigInteger("-9223372036854775809"),
                                Double.NaN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY)
                        .map(valor -> Arguments.of(campo, valor)));
        return Stream.concat(numeros, Stream.of(Arguments.of("userId", 0),
                Arguments.of("sub", null), Arguments.of("sub", ""), Arguments.of("sub", " \t"),
                Arguments.of("sub", 1)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"userId", "tokenVersion", "sub"})
    @DisplayName("Claim obrigatório ausente é rejeitado sem consultar a conta")
    void rejeitaClaimAusente(String campo) {
        Map<String, Object> claims = claimsValidos();
        claims.remove(campo);

        assertInvalido(validator.validate(token(claims)));

        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("Conta removida invalida o token")
    void rejeitaContaAusente() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertInvalido(validator.validate(token(1, 0, EMAIL)));
    }

    @Test
    @DisplayName("Conta sem credencial invalida o token")
    void rejeitaCredencialAusente() {
        usuario.setCredencialAutenticacao(null);
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        assertInvalido(validator.validate(token(1, 0, EMAIL)));
    }

    @Test
    @DisplayName("Versão revogada invalida o token mesmo com e-mail correto")
    void rejeitaVersaoRevogada() {
        usuario.getCredencialAutenticacao().setVersaoToken(1);
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        assertInvalido(validator.validate(token(1, 0, EMAIL)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"outra@example.test", "CONTA@example.test"})
    @DisplayName("Subject precisa coincidir exatamente com o e-mail atual")
    void rejeitaSubjectDiferente(String subject) {
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        assertInvalido(validator.validate(token(1, 0, subject)));
    }

    @Test
    @DisplayName("Falha de acesso à conta nega autenticação sem expor detalhes")
    void falhaFechadoQuandoBancoEstaIndisponivel() {
        when(repository.findById(1L)).thenThrow(new DataAccessResourceFailureException("detalhe interno"));

        assertInvalido(validator.validate(token(1, 0, EMAIL)));
    }

    private Map<String, Object> claimsValidos() {
        return new HashMap<>(Map.of("userId", 1, "tokenVersion", 0, "sub", EMAIL));
    }

    private Jwt token(Object id, Object versao, Object subject) {
        return token(Map.of("userId", id, "tokenVersion", versao, "sub", subject));
    }

    private Jwt token(Map<String, Object> claims) {
        // Construtor direto permite representar claims nulos ou de tipo incorreto, sem decoder.
        return new Jwt("token-ficticio", null, null, Map.of("alg", "HS256"), claims);
    }

    private void assertInvalido(OAuth2TokenValidatorResult resultado) {
        assertTrue(resultado.hasErrors());
        assertEquals(1, resultado.getErrors().size());
        var erro = resultado.getErrors().iterator().next();
        assertEquals("invalid_token", erro.getErrorCode());
        assertEquals("Autenticação necessária ou token inválido.", erro.getDescription());
    }
}
