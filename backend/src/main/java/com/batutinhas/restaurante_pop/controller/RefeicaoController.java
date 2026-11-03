package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.RefeicaoCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoResponseDTO;
import com.batutinhas.restaurante_pop.service.RefeicaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/refeicoes")
public class RefeicaoController {
    private final RefeicaoService refeicaoService;

    public RefeicaoController(RefeicaoService refeicaoService) {
        this.refeicaoService = refeicaoService;
    }

    @GetMapping
    public List<RefeicaoResponseDTO> getRefeicoes() {
        return refeicaoService.findAll();
    }

    @PostMapping
    public ResponseEntity<RefeicaoResponseDTO> createRefeicao(@RequestBody RefeicaoCreateRequestDTO request) {
        return ResponseEntity.ok(refeicaoService.create(request));
    }
}
