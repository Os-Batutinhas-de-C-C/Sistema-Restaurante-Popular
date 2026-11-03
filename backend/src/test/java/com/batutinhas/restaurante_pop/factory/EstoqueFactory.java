package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.dto.EstoqueCreateRequestDTO;
import com.batutinhas.restaurante_pop.model.Estoque;

import java.time.LocalDate;

public final class EstoqueFactory {
    private EstoqueFactory() {
    }

    public static EstoqueCreateRequestDTO criarEstoqueCreateRequestDTO() {
        return new EstoqueCreateRequestDTO(
                "Arroz",
                10.0,
                "kg",
                "LOTE-TESTE-01",
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 1, 1),
                "Item para testes automatizados"
        );
    }

    public static EstoqueCreateRequestDTO criarRequestSemNome() {
        EstoqueCreateRequestDTO request = criarEstoqueCreateRequestDTO();
        return new EstoqueCreateRequestDTO(
                "",
                request.quantidade(),
                request.unidade(),
                request.lote(),
                request.dataDeRecebimento(),
                request.dataDeValidade(),
                request.observacoes()
        );
    }

    public static Estoque criarEstoqueEntidadeValido() {
        EstoqueCreateRequestDTO request = criarEstoqueCreateRequestDTO();
        Estoque estoque = new Estoque();
        estoque.setNome(request.nome());
        estoque.setQuantidade(request.quantidade());
        estoque.setUnidade(request.unidade());
        estoque.setLote(request.lote());
        estoque.setDataDeRecebimento(request.dataDeRecebimento());
        estoque.setDataDeValidade(request.dataDeValidade());
        estoque.setObservacoes(request.observacoes());
        return estoque;
    }
}