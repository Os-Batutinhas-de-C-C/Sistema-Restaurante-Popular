package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/semanas")
public class SemanaController {
    private final SemanaRepository semanaRepository;

    public SemanaController(SemanaRepository semanaRepository) {
        this.semanaRepository = semanaRepository;
    }

    @GetMapping
    public List<Semana> getSemanas() {
        return semanaRepository.findAll();
    }

    @PostMapping
    public Semana createSemana(@RequestBody Semana semana) {
        return semanaRepository.save(semana);
    }

}
