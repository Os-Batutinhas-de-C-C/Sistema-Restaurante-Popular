package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.dto.RefeicaoRequestDTO;
import com.batutinhas.restaurante_pop.dto.SemanaCreateRequestDTO;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.model.Semana;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class SemanaFactory {
    private SemanaFactory() {
    }

    public static SemanaCreateRequestDTO criarSemanaCreateRequestDTO() {
        List<RefeicaoRequestDTO> cardapio = new ArrayList<>(Collections.nCopies(Semana.QUANTIDADE_DIAS_UTEIS, null));
        cardapio.set(0, RefeicaoFactory.criarRefeicaoRequestDTO());
        return new SemanaCreateRequestDTO(
                LocalDate.of(2026, 10, 12),
                new ArrayList<>(List.of(1.5)),
                new ArrayList<>(List.of(10)),
                cardapio
        );
    }

    public static SemanaCreateRequestDTO criarRequestSemData() {
        SemanaCreateRequestDTO request = criarSemanaCreateRequestDTO();
        return new SemanaCreateRequestDTO(
                null,
                new ArrayList<>(request.desperdicio()),
                new ArrayList<>(request.fichasVendidas()),
                new ArrayList<>(request.cardapio())
        );
    }

    public static Semana criarSemanaValida() {
        Semana semana = new Semana();
        semana.setData(LocalDate.of(2026, 10, 12));
        semana.setDesperdicio(new ArrayList<>(List.of(1.5)));
        semana.setFichasVendidas(new ArrayList<>(List.of(10)));
        List<Refeicao> cardapio = new ArrayList<>(Collections.nCopies(Semana.QUANTIDADE_DIAS_UTEIS, null));
        cardapio.set(0, RefeicaoFactory.criarRefeicaoEntidadeValida());
        semana.setCardapio(cardapio);
        return semana;
    }
}
