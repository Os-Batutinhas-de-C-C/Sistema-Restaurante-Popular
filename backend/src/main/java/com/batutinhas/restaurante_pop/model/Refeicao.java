package com.batutinhas.restaurante_pop.model;

import java.util.ArrayList;
import jakarta.persistence.*;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity 
@Table(name = "refeicoes", uniqueConstraints = @UniqueConstraint(columnNames = {"proteina", "guarnicao", "acompanhamento1", "acompanhamento2", "suco", "sobremesa", "opcao_proteica"}))
public class Refeicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_refeicao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semana_id")
    @JsonIgnore
    private Semana semana;

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

    public void setProteina(String proteina) { this.proteina = proteina; }

    public void setGuarnicao(String guarnicao) { this.guarnicao = guarnicao; }

    public void setAcompanhamento1(String acompanhamento1) { this.acompanhamento1 = acompanhamento1; }

    public void setAcompanhamento2(String acompanhamento2) { this.acompanhamento2 = acompanhamento2; }

    public void setSuco(String suco) { this.suco = suco; }

    public void setSobremesa(String sobremesa) { this.sobremesa = sobremesa; }

    public void setOpcaoProteica(String opcao_proteica) { this.opcao_proteica = opcao_proteica; }

    public void setCalorias(double calorias) { this.calorias = calorias; }
    
    public void setSemana(Semana semana) { this.semana = semana; }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Refeicao refeicao = (Refeicao) o;
        
        return Double.compare(refeicao.calorias, calorias) == 0 &&
               Objects.equals(proteina, refeicao.proteina) &&
               Objects.equals(guarnicao, refeicao.guarnicao) &&
               Objects.equals(acompanhamento1, refeicao.acompanhamento1) &&
               Objects.equals(acompanhamento2, refeicao.acompanhamento2) &&
               Objects.equals(suco, refeicao.suco) &&
               Objects.equals(sobremesa, refeicao.sobremesa) &&
               Objects.equals(opcao_proteica, refeicao.opcao_proteica);
    }

    @Override
    public int hashCode() {
        return Objects.hash(proteina, guarnicao, acompanhamento1, acompanhamento2, suco, sobremesa, opcao_proteica, calorias);
    }
}
