package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;


import com.batutinhas.restaurante_pop.model.*;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;

@RestController 
@RequestMapping("/api/refeicoes")
public class RefeicaoController {
    private final RefeicaoRepository refeicaoRepository;

    public RefeicaoController(RefeicaoRepository refeicaoRepository) {
        this.refeicaoRepository = refeicaoRepository;
    }

    @GetMapping
    public List<Refeicao> getRefeicoes() {
        return refeicaoRepository.findAll();
    }

    @PostMapping 
    public Refeicao createRefeicao(@RequestBody Refeicao refeicao) {
        return refeicaoRepository.save(refeicao);
    }
}
