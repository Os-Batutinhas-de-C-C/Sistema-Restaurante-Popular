package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.AuthResponseDTO;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** RF002: captura os parâmetros do encoder para proteger claims e duração, sem relógio real ou assinatura. */
@ExtendWith(MockitoExtension.class)
class JwtTokenServiceTest {
    @Mock private JwtEncoder encoder;

    @ParameterizedTest
    @CsvSource({"N,NUTRICIONISTA,Nutricionista", "C,CAIXA,Caixa", "G,GESTOR,Gestor", "X,USUARIO_COMUM,Usuário"})
    @DisplayName("Emissão usa claims públicos, HS256 e uma hora para cada papel")
    void emiteTokenComContratoCorreto(char tipo, String papel, String rotulo) {
        var usuario = UsuarioFactory.criarUsuarioEntidadeValido("sessao@example.test", tipo);
        ReflectionTestUtils.setField(usuario, "id_usuario", 42L);
        usuario.getCredencialAutenticacao().setVersaoToken(3);
        Jwt token = Jwt.withTokenValue("token-ficticio").header("alg", "HS256").subject("ficticio").build();
        when(encoder.encode(any(JwtEncoderParameters.class))).thenReturn(token);
        var service = new JwtTokenService(encoder, "emissor-de-teste");

        AuthResponseDTO resposta = service.issue(usuario);

        var captura = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(encoder).encode(captura.capture());
        var parametros = captura.getValue();
        var claims = parametros.getClaims();
        assertEquals(MacAlgorithm.HS256, parametros.getJwsHeader().getAlgorithm());
        assertEquals("emissor-de-teste", claims.getClaim("iss"));
        assertEquals(usuario.getEmailRecuperacao(), claims.getSubject());
        assertEquals(42L, claims.getClaims().get("userId"));
        assertEquals(3L, claims.getClaims().get("tokenVersion"));
        assertEquals(usuario.getNome(), claims.getClaim("name"));
        assertEquals(List.of(papel), claims.getClaim("roles"));
        assertEquals(Duration.ofHours(1), Duration.between(claims.getIssuedAt(), claims.getExpiresAt()));
        assertEquals(Set.of("iss", "iat", "exp", "sub", "roles", "userId", "tokenVersion", "name"),
                claims.getClaims().keySet());
        assertEquals("token-ficticio", resposta.accessToken());
        assertEquals("Bearer", resposta.tokenType());
        assertEquals(3600, resposta.expiresIn());
        assertEquals(new AuthResponseDTO.UsuarioSessaoDTO(42, usuario.getNome(), usuario.getEmailRecuperacao(), rotulo),
                resposta.usuario());
    }
}
