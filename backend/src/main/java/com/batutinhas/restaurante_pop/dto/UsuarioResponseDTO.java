package com.batutinhas.restaurante_pop.dto;

public record UsuarioResponseDTO(
        long idUsuario,
        String nome,
        String emailRecuperacao,
        char tipo
) {
}
