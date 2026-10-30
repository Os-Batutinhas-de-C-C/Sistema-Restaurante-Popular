package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.*;


@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_usuario;

    @Column
    private String nome;

    @Column
    private String emailRecuperacao;

    @Column
    private char tipo;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private CredencialAutenticacao credencialAutenticacao;

    
    public long getIdUsuario() {
        return id_usuario;
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
