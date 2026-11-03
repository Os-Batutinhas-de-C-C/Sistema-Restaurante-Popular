package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.AuthResponseDTO;
import com.batutinhas.restaurante_pop.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class JwtTokenService {
    private static final Duration TOKEN_LIFETIME = Duration.ofHours(1);

    private final JwtEncoder jwtEncoder;
    private final String issuer;

    public JwtTokenService(JwtEncoder jwtEncoder, @Value("${app.security.jwt.issuer}") String issuer) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
    }

    public AuthResponseDTO issue(Usuario usuario) {
        Instant issuedAt = Instant.now();
        String role = UsuarioPapel.role(usuario.getTipo());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(TOKEN_LIFETIME))
                .subject(usuario.getEmailRecuperacao())
                .claim("roles", List.of(role))
                .claim("userId", usuario.getIdUsuario())
                .claim("name", usuario.getNome())
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims
        )).getTokenValue();

        return new AuthResponseDTO(
                token,
                "Bearer",
                TOKEN_LIFETIME.toSeconds(),
                new AuthResponseDTO.UsuarioSessaoDTO(
                        usuario.getIdUsuario(),
                        usuario.getNome(),
                        usuario.getEmailRecuperacao(),
                        UsuarioPapel.label(usuario.getTipo())
                )
        );
    }
}
