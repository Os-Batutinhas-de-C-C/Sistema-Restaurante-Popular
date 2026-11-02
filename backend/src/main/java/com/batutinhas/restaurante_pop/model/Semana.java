package com.batutinhas.restaurante_pop.model; //

import java.time.LocalDate; 
import java.util.ArrayList;   
import java.util.List;
import jakarta.persistence.*;   

@Entity
@Table(name = "semanas")   
public class Semana {   
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)   
    private long id_semana;   

    @Column
    private LocalDate data;   

    @ElementCollection
    @CollectionTable(name = "semana_desperdicios", joinColumns = @JoinColumn(name = "semana_id"))
    @Column(name = "valor_desperdicio")
    private List<Double> desperdicio = new ArrayList<>();   

    @ElementCollection
    @CollectionTable(name = "semana_fichas", joinColumns = @JoinColumn(name = "semana_id"))
    @Column(name = "quantidade_fichas")
    private List<Integer> fichas_vendidas = new ArrayList<>();   

    @OneToMany(mappedBy = "semana", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Refeicao> cardapio = new ArrayList<>();   

    public long getIdSemana() { return id_semana; }   
    public LocalDate getData() { return data; }   
    public List<Double> getDesperdicio() { return desperdicio; }   
    public List<Integer> getFichasVendidas() { return fichas_vendidas; }   
    public List<Refeicao> getCardapio() { return cardapio; }   

    public void setData(LocalDate data) { this.data = data; }
    public void setDesperdicio(List<Double> desperdicio) { this.desperdicio = desperdicio; }
    public void setFichasVendidas(List<Integer> fichas_vendidas) { this.fichas_vendidas = fichas_vendidas; }
    
    public void addRefeicao(Refeicao novaRefeicao) {
        if (this.cardapio.size() >= 5) {
            throw new IllegalStateException("A semana já possui o limite máximo de 5 refeições.");
        }

        if (this.cardapio.contains(novaRefeicao)) {
            throw new IllegalArgumentException("Esta exata refeição já se encontra no cardápio desta semana.");
        }

        cardapio.add(novaRefeicao);
        novaRefeicao.setSemana(this);
    }

    public void removeRefeicao(Refeicao refeicao) {
        cardapio.remove(refeicao);
        refeicao.setSemana(null);
    }
}