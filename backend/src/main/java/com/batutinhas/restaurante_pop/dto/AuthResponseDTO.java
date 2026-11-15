package com.batutinhas.restaurante_pop.dto;

public record AuthResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn,
        UsuarioSessaoDTO usuario
) {
    public record UsuarioSessaoDTO(
            long idUsuario,
            String nome,
            String email,
            String perfil
    ) {
    }
}
