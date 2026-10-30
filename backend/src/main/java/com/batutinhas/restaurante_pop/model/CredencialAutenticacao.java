package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "credenciais_autenticacao")
public class CredencialAutenticacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_credencial;

    @Column 
    private String passwordHash;

    @Column 
    private String passwordSalt;

    @Column 
    private LocalDate dataCriacao;

    @Column 
    private int tentativasFalhas;

    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id_usuario")
    private Usuario usuario;

    public CredencialAutenticacao() {
        
    }

    public CredencialAutenticacao(String passwordHash, String passwordSalt, LocalDate dataCriacao, int tentativasFalhas, Usuario usuario) {
        this.passwordHash = passwordHash;
        this.passwordSalt = passwordSalt;
        this.dataCriacao = dataCriacao;
        this.tentativasFalhas = tentativasFalhas;
        this.usuario = usuario;
    }

    public Long getId_credencial() {
        return id_credencial;
    }

    public void setId_credencial(Long id_credencial) {
        this.id_credencial = id_credencial;
    }


    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPasswordSalt() {
        return passwordSalt;
    }

    public void setPasswordSalt(String passwordSalt) {
        this.passwordSalt = passwordSalt;
    }

    public LocalDate getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDate dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public int getTentativasFalhas() {
        return tentativasFalhas;
    }

    public void setTentativasFalhas(int tentativasFalhas) {
        this.tentativasFalhas = tentativasFalhas;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

}
