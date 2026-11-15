package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "semanas", uniqueConstraints = @UniqueConstraint(name = "uk_semanas_data", columnNames = "data"))
public class Semana {
    public static final int QUANTIDADE_DIAS_UTEIS = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id_semana;

    @Column(nullable = false)
    private LocalDate data;

    @ElementCollection
    @CollectionTable(name = "semana_desperdicios", joinColumns = @JoinColumn(name = "semana_id"))
    @OrderColumn(name = "posicao")
    @Column(name = "valor_desperdicio")
    private List<Double> desperdicio = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "semana_fichas", joinColumns = @JoinColumn(name = "semana_id"))
    @OrderColumn(name = "posicao")
    @Column(name = "quantidade_fichas")
    private List<Integer> fichas_vendidas = new ArrayList<>();

    @OneToMany(mappedBy = "semana", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("posicao ASC")
    private List<SemanaRefeicao> cardapioSlots = new ArrayList<>();

    public long getIdSemana() { return id_semana; }
    public LocalDate getData() { return data; }
    public List<Double> getDesperdicio() { return desperdicio; }
    public List<Integer> getFichasVendidas() { return fichas_vendidas; }
    public List<SemanaRefeicao> getCardapioSlots() { return cardapioSlots; }

    public void setData(LocalDate data) { this.data = data; }
    public void setDesperdicio(List<Double> desperdicio) { this.desperdicio = desperdicio; }
    public void setFichasVendidas(List<Integer> fichas_vendidas) { this.fichas_vendidas = fichas_vendidas; }

    public List<Refeicao> getCardapio() {
        List<Refeicao> cardapio = new ArrayList<>(Collections.nCopies(QUANTIDADE_DIAS_UTEIS, null));
        for (SemanaRefeicao slot : cardapioSlots) {
            if (slot.getPosicao() >= 0 && slot.getPosicao() < QUANTIDADE_DIAS_UTEIS) {
                cardapio.set(slot.getPosicao(), slot.getRefeicao());
            }
        }
        return cardapio;
    }

    public void setCardapio(List<Refeicao> cardapio) {
        List<Refeicao> values = cardapio == null
                ? new ArrayList<>(Collections.nCopies(QUANTIDADE_DIAS_UTEIS, null))
                : cardapio;
        if (values.size() != QUANTIDADE_DIAS_UTEIS) {
            throw new IllegalArgumentException("O cardápio semanal deve ter exatamente cinco posições.");
        }

        for (int posicao = 0; posicao < QUANTIDADE_DIAS_UTEIS; posicao++) {
            int slotPosicao = posicao;
            SemanaRefeicao slot = cardapioSlots.stream()
                    .filter(item -> item.getPosicao() == slotPosicao)
                    .findFirst()
                    .orElse(null);
            if (slot == null) {
                cardapioSlots.add(new SemanaRefeicao(this, posicao, values.get(posicao)));
            } else {
                slot.setRefeicao(values.get(posicao));
            }
        }
        cardapioSlots.removeIf(slot -> slot.getPosicao() < 0 || slot.getPosicao() >= QUANTIDADE_DIAS_UTEIS);
    }

    public void addRefeicao(Refeicao novaRefeicao) {
        if (novaRefeicao == null) throw new IllegalArgumentException("A refeição não pode ser nula.");
        List<Refeicao> cardapio = getCardapio();
        if (cardapio.contains(novaRefeicao)) {
            throw new IllegalArgumentException("Esta exata refeição já se encontra no cardápio desta semana.");
        }
        int slotVazio = cardapio.indexOf(null);
        if (slotVazio < 0) throw new IllegalStateException("A semana já possui o limite máximo de 5 refeições.");
        cardapio.set(slotVazio, novaRefeicao);
        setCardapio(cardapio);
    }

    public void removeRefeicao(Refeicao refeicao) {
        List<Refeicao> cardapio = getCardapio();
        int posicao = cardapio.indexOf(refeicao);
        if (posicao >= 0) {
            cardapio.set(posicao, null);
            setCardapio(cardapio);
        }
    }
}
