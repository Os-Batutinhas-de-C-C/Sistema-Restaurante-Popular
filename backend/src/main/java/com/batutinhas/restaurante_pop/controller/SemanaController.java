package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.SemanaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.SemanaResponseDTO;
import com.batutinhas.restaurante_pop.dto.SemanaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.service.SemanaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/semanas")
public class SemanaController {
    private final SemanaService semanaService;

    public SemanaController(SemanaService semanaService) {
        this.semanaService = semanaService;
    }

    @GetMapping
    public List<SemanaResponseDTO> getSemanas() {
        return semanaService.findAll();
    }

    @PostMapping
    public ResponseEntity<SemanaResponseDTO> createSemana(@RequestBody SemanaCreateRequestDTO request) {
        return ResponseEntity.ok(semanaService.create(request));
    }

    @PutMapping("/{data}")
    public ResponseEntity<SemanaResponseDTO> updateSemana(
            @PathVariable LocalDate data,
            @RequestBody SemanaUpdateRequestDTO request
    ) {
        return semanaService.update(data, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
