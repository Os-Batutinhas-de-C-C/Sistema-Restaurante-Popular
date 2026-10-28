package com.batutinhas.restaurante_pop.model;

import java.util.ArrayList;
import jakarta.persistence.*;


@Entity 
@Table(name = "refeicoes")
public class Refeicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_refeicao;

    @Column 
    private String proteina;
    @Column
    private String guarnicao;
    @Column
    private String acompanhamento1;
    @Column
    private String acompanhamento2;
    @Column
    private String suco;
    @Column
    private String sobremesa;
    @Column
    private String opcao_proteica;
    @Column
    private double calorias;
    

    public long getIdRefeicao() {
        return id_refeicao;
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
        return opcao_proteica;
    }

    public double getCalorias() {
        return calorias;
    }
}
