package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;

import java.time.LocalDate;

public final class CredencialFactory {
    private static final String PASSWORD_HASH = "$2a$10$teB5679eGyTW70Rynnu2zOJbt1tB.4VN69qDchqBjMenG36.T5UtK";

    private CredencialFactory() {
    }

    public static CredencialAutenticacao criarCredencialValida() {
        CredencialAutenticacao credencial = new CredencialAutenticacao();
        credencial.setPasswordHash(PASSWORD_HASH);
        credencial.setDataCriacao(LocalDate.of(2026, 1, 1));
        credencial.setTentativasFalhas(0);
        return credencial;
    }

    public static CredencialAutenticacao criarCredencialValida(Usuario usuario) {
        CredencialAutenticacao credencial = criarCredencialValida();
        credencial.setUsuario(usuario);
        return credencial;
    }
}