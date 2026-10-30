package com.batutinhas.restaurante_pop.model;

import java.time.*;

import jakarta.persistence.*;

@Entity
@Table(name = "mensagens")
@Inheritance (strategy = InheritanceType.JOINED)
public class Mensagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_mensagem;

    @Column
    private String texto;

    @Column 
    private LocalTime horario;

    @Column
    private LocalDate data;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public long getIdMensagem() {
        return id_mensagem;
    }

    public String getTexto() {
        return texto;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public LocalDate getData() {
        return data;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
