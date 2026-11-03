package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.FichasDiaResponseDTO;
import com.batutinhas.restaurante_pop.service.FichasService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fichas/hoje")
public class FichasController {
    private final FichasService fichasService;

    public FichasController(FichasService fichasService) {
        this.fichasService = fichasService;
    }

    @GetMapping
    public FichasDiaResponseDTO consultarHoje() {
        return fichasService.consultarHoje();
    }

    @PostMapping("/incrementos")
    public FichasDiaResponseDTO incrementarHoje() {
        return fichasService.incrementarHoje();
    }
}
