package com.batutinhas.restaurante_pop.model;

import java.time.LocalDate;

public class CredencialAutenticacao {
    private String passwordHash;
    private String passwordSalt;
    private LocalDate dataCriacao;
    private int tentativasFalhas;

    public CredencialAutenticacao() {
        
    }
}
