package com.batutinhas.restaurante_pop.dto;

public record UsuarioCreateRequestDTO(
        String nome,
        String emailRecuperacao,
        Character tipo,
        String senhaPura
) {
}
