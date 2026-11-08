package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class JwtTokenVersionValidator implements OAuth2TokenValidator<Jwt> {
    private static final OAuth2Error INVALID_TOKEN = new OAuth2Error(
            OAuth2ErrorCodes.INVALID_TOKEN,
            "Autenticação necessária ou token inválido.",
            null
    );

    private final UsuarioRepository usuarioRepository;

    public JwtTokenVersionValidator(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        Long userId = integralClaim(token.getClaims().get("userId"), 1);
        Long tokenVersion = integralClaim(token.getClaims().get("tokenVersion"), 0);
        Object subjectClaim = token.getClaims().get("sub");
        if (userId == null || tokenVersion == null
                || !(subjectClaim instanceof String subject) || subject.isBlank()) {
            return invalid();
        }

        try {
            Usuario usuario = usuarioRepository.findById(userId).orElse(null);
            if (usuario == null) return invalid();

            CredencialAutenticacao credencial = usuario.getCredencialAutenticacao();
            if (credencial == null || credencial.getVersaoToken() != tokenVersion
                    || !subject.equals(usuario.getEmailRecuperacao())) {
                return invalid();
            }

            return OAuth2TokenValidatorResult.success();
        } catch (DataAccessException exception) {
            // An unavailable account store cannot authorize a bearer token.
            return invalid();
        }
    }

    private static Long integralClaim(Object value, long minimum) {
        if (!(value instanceof Number number)) return null;
        try {
            long parsed = new BigDecimal(number.toString()).longValueExact();
            return parsed >= minimum ? parsed : null;
        } catch (ArithmeticException | NumberFormatException exception) {
            return null;
        }
    }

    private static OAuth2TokenValidatorResult invalid() {
        return OAuth2TokenValidatorResult.failure(INVALID_TOKEN);
    }
}
