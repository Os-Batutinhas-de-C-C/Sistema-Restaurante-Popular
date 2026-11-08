package com.batutinhas.restaurante_pop.service;

public final class UsuarioPapel {
    private UsuarioPapel() {
    }

    public static String role(char tipo) {
        return switch (Character.toUpperCase(tipo)) {
            case 'N' -> "NUTRICIONISTA";
            case 'C' -> "CAIXA";
            case 'G' -> "GESTOR";
            default -> "USUARIO_COMUM";
        };
    }

    public static String label(char tipo) {
        return switch (Character.toUpperCase(tipo)) {
            case 'N' -> "Nutricionista";
            case 'C' -> "Caixa";
            case 'G' -> "Gestor";
            default -> "Usuário";
        };
    }
}
