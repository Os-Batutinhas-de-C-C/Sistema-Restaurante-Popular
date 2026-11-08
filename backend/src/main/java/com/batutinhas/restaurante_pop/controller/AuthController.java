package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.ApiErrorDTO;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import com.batutinhas.restaurante_pop.service.JwtTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    public record LoginDTO(String email, String senha) {
    }

    @PostMapping("/login")
    public ResponseEntity<?> realizarLogin(@RequestBody LoginDTO dadosLogin) {
        if (dadosLogin == null || dadosLogin.email() == null || dadosLogin.senha() == null) {
            return unauthorized();
        }

        Usuario usuario = usuarioRepository.findByEmailRecuperacao(dadosLogin.email().trim()).orElse(null);
        if (usuario == null || usuario.getCredencialAutenticacao() == null
                || !passwordEncoder.matches(dadosLogin.senha(), usuario.getCredencialAutenticacao().getPasswordHash())) {
            return unauthorized();
        }

        return ResponseEntity.ok(jwtTokenService.issue(usuario));
    }

    private ResponseEntity<ApiErrorDTO> unauthorized() {
        return ResponseEntity.status(401)
                .body(new ApiErrorDTO("AUTHENTICATION_FAILED", "E-mail ou senha inválidos."));
    }
}
