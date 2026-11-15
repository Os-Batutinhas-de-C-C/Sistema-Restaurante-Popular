package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.ApiErrorDTO;
import com.batutinhas.restaurante_pop.dto.AuthResponseDTO;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import com.batutinhas.restaurante_pop.service.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** RF002: protege o login sem HTTP, simulando busca, conferência de senha e emissão. */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    private static final String EMAIL = "conta@example.test";
    private static final String SENHA = "senha-de-teste";
    @Mock private UsuarioRepository repository;
    @Mock private PasswordEncoder encoder;
    @Mock private JwtTokenService tokens;
    private AuthController controller;
    private Usuario usuario;

    @BeforeEach
    void preparar() {
        controller = new AuthController(repository, encoder, tokens);
        usuario = UsuarioFactory.criarUsuarioEntidadeValido(EMAIL, 'C');
    }

    @Test
    @DisplayName("Login válido remove espaços do e-mail e emite somente um token")
    void autenticaCredenciaisValidas() {
        var sessao = new AuthResponseDTO("token-ficticio", "Bearer", 3600,
                new AuthResponseDTO.UsuarioSessaoDTO(0, usuario.getNome(), EMAIL, "Caixa"));
        when(repository.findByEmailRecuperacao(EMAIL)).thenReturn(Optional.of(usuario));
        when(encoder.matches(SENHA, usuario.getCredencialAutenticacao().getPasswordHash())).thenReturn(true);
        when(tokens.issue(usuario)).thenReturn(sessao);

        var resposta = controller.realizarLogin(new AuthController.LoginDTO("  " + EMAIL + "  ", SENHA));

        assertEquals(200, resposta.getStatusCode().value());
        assertSame(sessao, resposta.getBody());
        verify(tokens).issue(usuario);
        verify(repository).findByEmailRecuperacao(EMAIL);
        verifyNoMoreInteractions(tokens);
    }

    @ParameterizedTest
    @MethodSource("loginsNulos")
    @DisplayName("Dados nulos são rejeitados antes de consultar a conta")
    void rejeitaDadosNulos(AuthController.LoginDTO request) {
        assertFalhaGenerica(controller.realizarLogin(request));
        verifyNoInteractions(repository, encoder, tokens);
    }

    static Stream<AuthController.LoginDTO> loginsNulos() {
        return Stream.of(null, new AuthController.LoginDTO(null, SENHA), new AuthController.LoginDTO(EMAIL, null));
    }

    @Test
    @DisplayName("Conta inexistente não confere senha nem emite token")
    void rejeitaContaAusente() {
        when(repository.findByEmailRecuperacao(EMAIL)).thenReturn(Optional.empty());

        assertFalhaGenerica(controller.realizarLogin(new AuthController.LoginDTO(EMAIL, SENHA)));

        verifyNoInteractions(encoder, tokens);
    }

    @Test
    @DisplayName("Conta sem credencial recebe o mesmo erro genérico")
    void rejeitaCredencialAusente() {
        usuario.setCredencialAutenticacao(null);
        when(repository.findByEmailRecuperacao(EMAIL)).thenReturn(Optional.of(usuario));

        assertFalhaGenerica(controller.realizarLogin(new AuthController.LoginDTO(EMAIL, SENHA)));

        verifyNoInteractions(encoder, tokens);
    }

    @Test
    @DisplayName("Senha incorreta nunca emite token")
    void rejeitaSenhaIncorreta() {
        when(repository.findByEmailRecuperacao(EMAIL)).thenReturn(Optional.of(usuario));
        when(encoder.matches(SENHA, usuario.getCredencialAutenticacao().getPasswordHash())).thenReturn(false);

        assertFalhaGenerica(controller.realizarLogin(new AuthController.LoginDTO(EMAIL, SENHA)));

        verifyNoInteractions(tokens);
    }

    private void assertFalhaGenerica(ResponseEntity<?> resposta) {
        assertEquals(401, resposta.getStatusCode().value());
        assertEquals(new ApiErrorDTO("AUTHENTICATION_FAILED", "E-mail ou senha inválidos."), resposta.getBody());
    }
}
