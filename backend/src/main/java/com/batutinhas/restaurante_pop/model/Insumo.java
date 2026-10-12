package com.batutinhas.restaurante_pop.model;

import java.time.LocalDate;

public class Insumo {
    private long idMaterial;
    private String nome;
    private double quantidade;
    private String unidade;
    private String lote;
    private LocalDate dataRecebimento;
    private LocalDate dataValidade;
    private String observacoes;

    public Insumo() {
        
    }

    public long getIdMaterial() {
        return idMaterial;
    }

    public String getNome() {
        return nome;
    }

    public double getQuantidade() {
        return quantidade;
    }

    public String getUnidade() {
        return unidade;
    }

    public String getLote() {
        return lote;
    }

    public LocalDate getDataRecebimento() {
        return dataRecebimento;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public String getObservacoes() {
        return observacoes;
    }
}
