package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.PerfilUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.PerfilUpdateResponseDTO;
import com.batutinhas.restaurante_pop.dto.SenhaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.UsuarioResponseDTO;
import com.batutinhas.restaurante_pop.exception.PerfilException;
import com.batutinhas.restaurante_pop.service.PerfilService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** RF012: identidade vem do JWT; chamadas diretas não comprovam o filtro HTTP de segurança. */
@ExtendWith(MockitoExtension.class)
@DisplayName("RF012 — Identidade própria no controller de perfil")
class PerfilControllerTest {
    @Mock private PerfilService perfis;

    @Test
    @DisplayName("Consulta usa exclusivamente userId extraído do JWT")
    void consultaUsaIdDoToken() {
        var esperado = new UsuarioResponseDTO(42L, "Conta de teste", "conta@example.test", 'C');
        when(perfis.consultar(42L)).thenReturn(esperado);

        var resultado = new PerfilController(perfis).getPerfil(token("42", null));

        assertThat(resultado).isSameAs(esperado);
        verify(perfis).consultar(42L);
    }

    @Test
    @DisplayName("Atualização encaminha ID e versão do JWT sem trocar o request")
    void atualizarEncaminhaIdentidadeEVersao() {
        var request = new PerfilUpdateRequestDTO("Novo nome", "conta@example.test", null);
        var esperado = new PerfilUpdateResponseDTO(new UsuarioResponseDTO(42L, request.nome(), request.emailRecuperacao(), 'C'), false);
        when(perfis.atualizar(42L, 7L, request)).thenReturn(esperado);

        var resultado = new PerfilController(perfis).updatePerfil(token("42", "7"), request);

        assertThat(resultado).isSameAs(esperado);
        verify(perfis).atualizar(42L, 7L, request);
    }

    @Test
    @DisplayName("Troca de senha encaminha a identidade e retorna 204 sem corpo")
    void alterarSenhaRetornaNoContent() {
        var request = new SenhaUpdateRequestDTO("antiga", "nova123", "nova123");

        var resultado = new PerfilController(perfis).updateSenha(token("42", "0"), request);

        verify(perfis).alterarSenha(42L, 0L, request);
        assertThat(resultado.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(resultado.getBody()).isNull();
    }

    @ParameterizedTest(name = "userId inválido: {0}")
    @NullSource
    @ValueSource(strings = {"", "abc", "0", "-1", "1.5", "9223372036854775808"})
    @DisplayName("ID ausente ou inválido bloqueia consulta antes de chamar o service")
    void consultaRejeitaIdInvalido(String id) {
        assertThatThrownBy(() -> new PerfilController(perfis).getPerfil(token(id, "0")))
                .isInstanceOfSatisfying(PerfilException.class, erro -> {
                    assertThat(erro.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(erro.getCode()).isEqualTo("UNAUTHORIZED");
                });
        verifyNoInteractions(perfis);
    }

    @ParameterizedTest(name = "tokenVersion inválida: {0}")
    @NullSource
    @ValueSource(strings = {"", "abc", "-1", "1.5", "9223372036854775808"})
    @DisplayName("Versão ausente ou inválida bloqueia atualização de perfil")
    void atualizarRejeitaVersaoInvalida(String versao) {
        var request = new PerfilUpdateRequestDTO("Nome", "conta@example.test", null);

        assertThatThrownBy(() -> new PerfilController(perfis).updatePerfil(token("42", versao), request))
                .isInstanceOfSatisfying(PerfilException.class, erro -> assertThat(erro.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(perfis);
    }

    @ParameterizedTest(name = "tokenVersion inválida: {0}")
    @NullSource
    @ValueSource(strings = {"", "abc", "-1", "1.5"})
    @DisplayName("Versão ausente ou inválida bloqueia troca de senha")
    void alterarSenhaRejeitaVersaoInvalida(String versao) {
        var request = new SenhaUpdateRequestDTO("antiga", "nova123", "nova123");

        assertThatThrownBy(() -> new PerfilController(perfis).updateSenha(token("42", versao), request))
                .isInstanceOfSatisfying(PerfilException.class, erro -> assertThat(erro.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(perfis);
    }

    @Test
    @DisplayName("JWT nulo é rejeitado com 401 antes de consultar o perfil")
    void consultaRejeitaTokenNulo() {
        assertThatThrownBy(() -> new PerfilController(perfis).getPerfil(null))
                .isInstanceOfSatisfying(PerfilException.class, erro -> assertThat(erro.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(perfis);
    }

    private Jwt token(String id, String versao) {
        var builder = Jwt.withTokenValue("token-de-teste").header("alg", "HS256").subject("conta@example.test");
        if (id != null) builder.claim("userId", id);
        if (versao != null) builder.claim("tokenVersion", versao);
        return builder.build();
    }
}
