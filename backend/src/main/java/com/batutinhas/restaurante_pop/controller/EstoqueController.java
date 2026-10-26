package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;

import java.util.List;
import com.batutinhas.restaurante_pop.repository.EstoqueRepository;


@RestController
@RequestMapping("/api/estoque")
public class EstoqueController {
        private final EstoqueRepository estoqueRepository;

        public EstoqueController(EstoqueRepository estoqueRepository) {
                this.estoqueRepository = estoqueRepository;
        }

        @GetMapping
        public List<Estoque> getEstoque() {
                return estoqueRepository.findAll();
        }

        @PostMapping
        public Estoque createEstoque(@RequestBody Estoque estoque) {
                return estoqueRepository.save(estoque);
        }
}
