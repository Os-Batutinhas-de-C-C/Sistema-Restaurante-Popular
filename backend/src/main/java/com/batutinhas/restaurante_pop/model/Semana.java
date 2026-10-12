package com.batutinhas.restaurante_pop.model;

import java.time.LocalDate;
import java.util.ArrayList;

public class Semana {
    private long idSemana;
    private LocalDate data;
    private double desperdicio;
    private int fichasVendidas;
    private ArrayList<Refeicao> cardapio = new ArrayList<Refeicao>(5);

    public Semana() {

    }

    public long getIdSemana() {
        return idSemana;
    }

    public LocalDate getData() {
        return data;
    }

    public double getDesperdicio() {
        return desperdicio;
    }

    public int getFichasVendidas() {
        return fichasVendidas;
    }

    public ArrayList<Refeicao> getCardapio() {
        return cardapio;
    }
}
