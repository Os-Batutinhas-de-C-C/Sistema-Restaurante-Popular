package com.batutinhas.restaurante_pop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.service.SemanaService;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/semanas")
public class SemanaController {
    private final SemanaRepository semanaRepository;
    private final SemanaService semanaService;

    public SemanaController(SemanaRepository semanaRepository) {
        this.semanaRepository = semanaRepository;
        this.semanaService = new SemanaService();
    }

    @GetMapping
    public List<Semana> getSemanas() {
        return semanaRepository.findAll();
    }

    @PostMapping
    public Semana createSemana(@RequestBody Semana semana) {
        return semanaRepository.save(semana);
    }

    @PutMapping("/{data}")
    public ResponseEntity<Semana> updateSemana(@PathVariable LocalDate data, @RequestBody Semana detalhesSemana) {
        return semanaService.findByData(data).map(semanaExistente -> {
            semanaExistente.setDesperdicio(detalhesSemana.getDesperdicio());
            semanaExistente.setFichasVendidas(detalhesSemana.getFichasVendidas());
            semanaExistente.setCardapio(detalhesSemana.getCardapio());

            
            Semana atualizada = semanaRepository.save(semanaExistente);
            return ResponseEntity.ok(atualizada);
        }).orElse(ResponseEntity.notFound().build());
    }

}
