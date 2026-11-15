package com.batutinhas.restaurante_pop.model;

import java.util.ArrayList;
import jakarta.persistence.*;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity 
@Table(name = "refeicoes", uniqueConstraints = @UniqueConstraint(name = "uk_refeicoes_composicao", columnNames = {"proteina", "guarnicao", "acompanhamento1", "acompanhamento2", "suco", "sobremesa", "opcao_proteica", "salada_do_dia"}))
public class Refeicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_refeicao;

    @Column 
    private String proteina;
    @Column
    private String guarnicao;
    @Column(name = "salada_do_dia")
    private String salada_do_dia;
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

    public String getSaladaDoDia() {
        return salada_do_dia;
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

    public void setSaladaDoDia(String saladaDoDia) { this.salada_do_dia = saladaDoDia; }

    public void setAcompanhamento1(String acompanhamento1) { this.acompanhamento1 = acompanhamento1; }

    public void setAcompanhamento2(String acompanhamento2) { this.acompanhamento2 = acompanhamento2; }

    public void setSuco(String suco) { this.suco = suco; }

    public void setSobremesa(String sobremesa) { this.sobremesa = sobremesa; }

    public void setOpcaoProteica(String opcao_proteica) { this.opcao_proteica = opcao_proteica; }

    public void setCalorias(double calorias) { this.calorias = calorias; }
    



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Refeicao refeicao = (Refeicao) o;
        
        return Objects.equals(proteina, refeicao.proteina) &&
               Objects.equals(guarnicao, refeicao.guarnicao) &&
               Objects.equals(salada_do_dia, refeicao.salada_do_dia) &&
               Objects.equals(acompanhamento1, refeicao.acompanhamento1) &&
               Objects.equals(acompanhamento2, refeicao.acompanhamento2) &&
               Objects.equals(suco, refeicao.suco) &&
               Objects.equals(sobremesa, refeicao.sobremesa) &&
               Objects.equals(opcao_proteica, refeicao.opcao_proteica);
    }

    @Override
    public int hashCode() {
        return Objects.hash(proteina, guarnicao, salada_do_dia, acompanhamento1, acompanhamento2, suco, sobremesa, opcao_proteica);
    }
}
