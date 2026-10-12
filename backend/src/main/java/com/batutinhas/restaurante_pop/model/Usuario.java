package com.batutinhas.restaurante_pop.model;

public class Usuario {
    private long idUsuario;
    private String nome;
    private String emailRecuperacao;
    private char tipo;
    private CredencialAutenticacao senha;

    public Usuario() {
    }

    public Usuario(long id, String nome, String email, char tipo) {
        this.idUsuario = id;
        this.nome = nome;
        this.emailRecuperacao = email;
        this.tipo = tipo;
    }

    public long getIdUsuario() {
        return idUsuario;
    }

    public String getNome() {
        return nome;
    }

    public String getEmailRecuperacao() {
        return emailRecuperacao;
    }

    public char getTipo() {
        return tipo;
    }
}
