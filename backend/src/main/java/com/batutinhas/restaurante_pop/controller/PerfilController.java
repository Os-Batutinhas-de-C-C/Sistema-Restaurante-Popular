package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.PerfilUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.PerfilUpdateResponseDTO;
import com.batutinhas.restaurante_pop.dto.SenhaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.UsuarioResponseDTO;
import com.batutinhas.restaurante_pop.exception.PerfilException;
import com.batutinhas.restaurante_pop.service.PerfilService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios/me")
public class PerfilController {
    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public UsuarioResponseDTO getPerfil(@AuthenticationPrincipal Jwt jwt) {
        return perfilService.consultar(claim(jwt, "userId", 1));
    }

    @PutMapping
    public PerfilUpdateResponseDTO updatePerfil(
            @AuthenticationPrincipal Jwt jwt, @RequestBody PerfilUpdateRequestDTO request
    ) {
        return perfilService.atualizar(
                claim(jwt, "userId", 1), claim(jwt, "tokenVersion", 0), request);
    }

    @PutMapping("/senha")
    public ResponseEntity<Void> updateSenha(
            @AuthenticationPrincipal Jwt jwt, @RequestBody SenhaUpdateRequestDTO request
    ) {
        perfilService.alterarSenha(
                claim(jwt, "userId", 1), claim(jwt, "tokenVersion", 0), request);
        return ResponseEntity.noContent().build();
    }

    private long claim(Jwt jwt, String name, long minimum) {
        try {
            long value = Long.parseLong(jwt.getClaimAsString(name));
            if (value >= minimum) return value;
        } catch (RuntimeException exception) {
            // The decoder validates these claims; keep a safe fallback here.
        }
        throw new PerfilException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Autenticação necessária.");
    }
}
