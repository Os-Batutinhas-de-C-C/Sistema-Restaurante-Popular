package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.dto.RefeicaoCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoRequestDTO;
import com.batutinhas.restaurante_pop.model.Refeicao;

public final class RefeicaoFactory {
    private RefeicaoFactory() {
    }

    public static RefeicaoCreateRequestDTO criarRefeicaoCreateRequestDTO() {
        return new RefeicaoCreateRequestDTO(
                "Frango",
                "Arroz",
                "Feijao",
                "Salada",
                "Caju",
                "Fruta",
                "Ovo",
                450.0
        );
    }

    public static RefeicaoRequestDTO criarRefeicaoRequestDTO() {
        RefeicaoCreateRequestDTO refeicao = criarRefeicaoCreateRequestDTO();
        return new RefeicaoRequestDTO(
                null,
                refeicao.proteina(),
                refeicao.guarnicao(),
                refeicao.acompanhamento1(),
                refeicao.acompanhamento2(),
                refeicao.suco(),
                refeicao.sobremesa(),
                refeicao.opcaoProteica(),
                refeicao.calorias()
        );
    }

    public static RefeicaoRequestDTO criarReferenciaDeRefeicao(Long idRefeicao) {
        return new RefeicaoRequestDTO(idRefeicao, null, null, null, null, null, null, null, null);
    }

    public static RefeicaoCreateRequestDTO criarRefeicaoSemProteinaDTO() {
        RefeicaoCreateRequestDTO refeicao = criarRefeicaoCreateRequestDTO();
        return new RefeicaoCreateRequestDTO(
                null,
                refeicao.guarnicao(),
                refeicao.acompanhamento1(),
                refeicao.acompanhamento2(),
                refeicao.suco(),
                refeicao.sobremesa(),
                refeicao.opcaoProteica(),
                refeicao.calorias()
        );
    }

    public static Refeicao criarRefeicaoEntidadeValida() {
        RefeicaoCreateRequestDTO request = criarRefeicaoCreateRequestDTO();
        Refeicao refeicao = new Refeicao();
        refeicao.setProteina(request.proteina());
        refeicao.setGuarnicao(request.guarnicao());
        refeicao.setAcompanhamento1(request.acompanhamento1());
        refeicao.setAcompanhamento2(request.acompanhamento2());
        refeicao.setSuco(request.suco());
        refeicao.setSobremesa(request.sobremesa());
        refeicao.setOpcaoProteica(request.opcaoProteica());
        refeicao.setCalorias(request.calorias());
        return refeicao;
    }
}