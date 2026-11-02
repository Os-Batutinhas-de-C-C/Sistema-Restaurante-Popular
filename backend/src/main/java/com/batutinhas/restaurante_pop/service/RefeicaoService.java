package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.RefeicaoCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoResponseDTO;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RefeicaoService {
    private final RefeicaoRepository refeicaoRepository;

    public RefeicaoService(RefeicaoRepository refeicaoRepository) {
        this.refeicaoRepository = refeicaoRepository;
    }

    @Transactional(readOnly = true)
    public List<RefeicaoResponseDTO> findAll() {
        return refeicaoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RefeicaoResponseDTO create(RefeicaoCreateRequestDTO request) {
        Refeicao refeicao = new Refeicao();
        refeicao.setProteina(RequestValidation.text(request.proteina(), "proteina", 255));
        refeicao.setGuarnicao(RequestValidation.text(request.guarnicao(), "guarnicao", 255));
        refeicao.setAcompanhamento1(RequestValidation.text(request.acompanhamento1(), "acompanhamento1", 255));
        refeicao.setAcompanhamento2(RequestValidation.text(request.acompanhamento2(), "acompanhamento2", 255));
        refeicao.setSuco(RequestValidation.text(request.suco(), "suco", 255));
        refeicao.setSobremesa(RequestValidation.text(request.sobremesa(), "sobremesa", 255));
        refeicao.setOpcaoProteica(RequestValidation.text(request.opcaoProteica(), "opcaoProteica", 255));
        refeicao.setCalorias(request.calorias() == null ? 0 : request.calorias());
        return toResponseDTO(refeicaoRepository.save(refeicao));
    }

    private RefeicaoResponseDTO toResponseDTO(Refeicao refeicao) {
        return new RefeicaoResponseDTO(
                refeicao.getIdRefeicao(),
                refeicao.getProteina(),
                refeicao.getGuarnicao(),
                refeicao.getAcompanhamento1(),
                refeicao.getAcompanhamento2(),
                refeicao.getSuco(),
                refeicao.getSobremesa(),
                refeicao.getOpcaoProteica(),
                refeicao.getCalorias()
        );
    }
}
