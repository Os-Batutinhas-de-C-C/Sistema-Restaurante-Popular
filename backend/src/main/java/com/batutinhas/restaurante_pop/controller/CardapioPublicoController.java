package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.CardapioPublicoResponseDTO;
import com.batutinhas.restaurante_pop.service.SemanaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cardapios/publicos")
public class CardapioPublicoController {
    private final SemanaService semanaService;

    public CardapioPublicoController(SemanaService semanaService) {
        this.semanaService = semanaService;
    }

    @GetMapping
    public List<CardapioPublicoResponseDTO> getCardapiosPublicos() {
        return semanaService.findAllPublic();
    }
}
