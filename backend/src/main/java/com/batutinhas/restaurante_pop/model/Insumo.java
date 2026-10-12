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
}
