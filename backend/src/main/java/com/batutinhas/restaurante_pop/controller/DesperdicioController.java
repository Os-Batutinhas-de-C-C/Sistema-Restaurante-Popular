package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.DesperdicioDiaResponseDTO;
import com.batutinhas.restaurante_pop.service.DesperdicioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/desperdicio/hoje")
public class DesperdicioController {
    private final DesperdicioService desperdicioService;

    public DesperdicioController(DesperdicioService desperdicioService) {
        this.desperdicioService = desperdicioService;
    }

    @GetMapping
    public DesperdicioDiaResponseDTO consultarHoje() {
        return desperdicioService.consultarHoje();
    }
}
