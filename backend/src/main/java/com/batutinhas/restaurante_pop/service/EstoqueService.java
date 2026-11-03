package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.EstoqueCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueResponseDTO;
import com.batutinhas.restaurante_pop.model.Estoque;
import com.batutinhas.restaurante_pop.repository.EstoqueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EstoqueService {
    private final EstoqueRepository estoqueRepository;

    public EstoqueService(EstoqueRepository estoqueRepository) {
        this.estoqueRepository = estoqueRepository;
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponseDTO> findAll() {
        return estoqueRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EstoqueResponseDTO create(EstoqueCreateRequestDTO request) {
        validateText(request.nome(), "nome");
        validateText(request.unidade(), "unidade");
        validateText(request.lote(), "lote");
        validateText(request.observacoes(), "observacoes");

        Estoque estoque = new Estoque();
        estoque.setNome(request.nome());
        estoque.setQuantidade(request.quantidade() == null ? 0 : request.quantidade());
        estoque.setUnidade(request.unidade());
        estoque.setLote(request.lote());
        estoque.setDataDeRecebimento(request.dataDeRecebimento());
        estoque.setDataDeValidade(request.dataDeValidade());
        estoque.setObservacoes(request.observacoes());
        return toResponseDTO(estoqueRepository.save(estoque));
    }

    private void validateText(String value, String field) {
        RequestValidation.text(value, field, 255);
    }

    private EstoqueResponseDTO toResponseDTO(Estoque estoque) {
        return new EstoqueResponseDTO(
                estoque.getIdMaterial(),
                estoque.getNome(),
                estoque.getQuantidade(),
                estoque.getUnidade(),
                estoque.getLote(),
                estoque.getDataDeRecebimento(),
                estoque.getDataDeValidade(),
                estoque.getObservacoes()
        );
    }
}
