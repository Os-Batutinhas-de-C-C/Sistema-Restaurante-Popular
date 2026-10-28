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
}
