package com.batutinhas.restaurante_pop.model;

import java.time.LocalDate;
import java.util.ArrayList;
import jakarta.persistence.*;

@Entity
@Table(name = "semanas")
public class Semana {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_semana;

    @Column
    private LocalDate data;

    @Column
    private ArrayList<Double> desperdicio = new ArrayList<Double>(5);

    @Column
    private ArrayList<Integer> fichas_vendidas = new ArrayList<Integer>(5);

    @Column
    private ArrayList<Refeicao> cardapio = new ArrayList<Refeicao>(5);


    public long getIdSemana() {
        return id_semana;
    }

    public LocalDate getData() {
        return data;
    }

    public ArrayList<Double> getDesperdicio() {
        return desperdicio;
    }

    public ArrayList<Integer> getFichasVendidas() {
        return fichas_vendidas;
    }

    public ArrayList<Refeicao> getCardapio() {
        return cardapio;
    }
}
