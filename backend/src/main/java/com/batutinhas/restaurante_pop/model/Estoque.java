package com.batutinhas.restaurante_pop.model;

import java.time.LocalDate;

import jakarta.persistence.*;


@Entity 
@Table (name = "estoque")
public class Estoque {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private long id_material;

    @Column 
    private String nome;
    @Column 
    private double quantidade;
    @Column 
    private String unidade;
    @Column 
    private String lote;
    @Column 
    private LocalDate data_de_recebimento;
    @Column 
    private LocalDate data_de_validade;
    @Column 
    private String observacoes;

    public long getIdMaterial() {
        return id_material;
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

    public LocalDate getDataDeRecebimento() {
        return data_de_recebimento;
    }

    public LocalDate getDataDeValidade() {
        return data_de_validade;
    }

    public String getObservacoes() {
        return observacoes;
    }
}
