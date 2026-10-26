package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.*;

@Entity 
@Table(name = "noticias")
@PrimaryKeyJoinColumn(name = "id_mensagem")
public class Noticia extends Mensagem{
    @Column
    private int duracao;


    public int getDuracao() {
        return duracao;
    }
}
