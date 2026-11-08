package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.EstoqueCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueResponseDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueUpdateRequestDTO;
import com.batutinhas.restaurante_pop.model.Estoque;
import com.batutinhas.restaurante_pop.repository.EstoqueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EstoqueService {
    private static final ZoneId ZONA_NEGOCIO = ZoneId.of("America/Fortaleza");
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
        Estoque estoque = new Estoque();
        applyValues(estoque, request.nome(), request.quantidade(), request.unidade(), request.lote(),
                request.dataDeRecebimento(), request.dataDeValidade(), request.observacoes());
        return toResponseDTO(estoqueRepository.save(estoque));
    }

    @Transactional
    public Optional<EstoqueResponseDTO> update(Long idMaterial, EstoqueUpdateRequestDTO request) {
        return estoqueRepository.findById(idMaterial).map(estoque -> {
            applyValues(estoque, request.nome(), request.quantidade(), request.unidade(), request.lote(),
                    request.dataDeRecebimento(), request.dataDeValidade(), request.observacoes());
            return toResponseDTO(estoqueRepository.save(estoque));
        });
    }

    @Transactional
    public boolean delete(Long idMaterial) {
        if (!estoqueRepository.existsById(idMaterial)) return false;
        estoqueRepository.deleteById(idMaterial);
        return true;
    }

    private void applyValues(
            Estoque estoque,
            String nome,
            Double quantidade,
            String unidade,
            String lote,
            LocalDate dataDeRecebimento,
            LocalDate dataDeValidade,
            String observacoes
    ) {
        RequestValidation.text(nome, "nome", 255);
        estoque.setQuantidade(quantidade == null ? 0 : quantidade);
        RequestValidation.text(unidade, "unidade", 255);
        RequestValidation.text(lote, "lote", 255);
        RequestValidation.text(observacoes, "observacoes", 255);
        estoque.setNome(nome);
        estoque.setUnidade(unidade);
        estoque.setLote(lote);
        estoque.setDataDeRecebimento(dataDeRecebimento);
        estoque.setDataDeValidade(dataDeValidade);
        estoque.setObservacoes(observacoes);
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
                estoque.getObservacoes(),
                calcularStatus(estoque.getDataDeValidade())
        );
    }

    private String calcularStatus(LocalDate dataValidade) {
        if (dataValidade == null) return "No prazo";
        LocalDate hoje = LocalDate.now(ZONA_NEGOCIO);
        if (dataValidade.isBefore(hoje)) return "Vencido";
        if (!dataValidade.isAfter(hoje.plusDays(7))) return "Vence em breve";
        return "No prazo";
    }
}
