package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "semana_cardapio_slots",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_semana_cardapio_posicao", columnNames = {"semana_id", "posicao"}),
                @UniqueConstraint(name = "uk_semana_cardapio_refeicao", columnNames = {"semana_id", "refeicao_id"})
        }
)
public class SemanaRefeicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semana_id", nullable = false)
    private Semana semana;

    @Column(name = "posicao", nullable = false)
    private int posicao;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "refeicao_id")
    private Refeicao refeicao;

    protected SemanaRefeicao() {
    }

    public SemanaRefeicao(Semana semana, int posicao, Refeicao refeicao) {
        this.semana = semana;
        this.posicao = posicao;
        this.refeicao = refeicao;
    }

    public Long getId() {
        return id;
    }

    public Semana getSemana() {
        return semana;
    }

    public void setSemana(Semana semana) {
        this.semana = semana;
    }

    public int getPosicao() {
        return posicao;
    }

    public void setPosicao(int posicao) {
        this.posicao = posicao;
    }

    public Refeicao getRefeicao() {
        return refeicao;
    }

    public void setRefeicao(Refeicao refeicao) {
        this.refeicao = refeicao;
    }
}
