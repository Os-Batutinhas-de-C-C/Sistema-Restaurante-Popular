package com.batutinhas.restaurante_pop.model;

import java.util.ArrayList;

public class Refeicao {
    private long idRefeicao;
    private String proteina;
    private String guarnicao;
    private String acompanhamento1;
    private String acompanhamento2;
    private String suco;
    private String sobremesa;
    private String opcaoProteica;
    private double calorias;
    private static ArrayList<Refeicao> Refeicoes;
    
    public Refeicao() {

    }

    public long getIdRefeicao() {
        return idRefeicao;
    }

    public String getProteina() {
        return proteina;
    }

    public String getGuarnicao() {
        return guarnicao;
    }

    public String getAcompanhamento1() {
        return acompanhamento1;
    }

    public String getAcompanhamento2() {
        return acompanhamento2;
    }

    public String getSuco() {
        return suco;
    }

    public String getSobremesa() {
        return sobremesa;
    }

    public String getOpcaoProteica() {
        return opcaoProteica;
    }

    public double getCalorias() {
        return calorias;
    }
}
