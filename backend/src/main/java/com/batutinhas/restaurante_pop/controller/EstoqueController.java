package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.EstoqueCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueResponseDTO;
import com.batutinhas.restaurante_pop.dto.EstoqueUpdateRequestDTO;
import com.batutinhas.restaurante_pop.service.EstoqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/estoque")
public class EstoqueController {
    private final EstoqueService estoqueService;

    public EstoqueController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @GetMapping
    public List<EstoqueResponseDTO> getEstoque() {
        return estoqueService.findAll();
    }

    @PostMapping
    public ResponseEntity<EstoqueResponseDTO> createEstoque(@RequestBody EstoqueCreateRequestDTO request) {
        return ResponseEntity.ok(estoqueService.create(request));
    }

    @PutMapping("/{idMaterial}")
    public ResponseEntity<EstoqueResponseDTO> updateEstoque(
            @PathVariable Long idMaterial,
            @RequestBody EstoqueUpdateRequestDTO request
    ) {
        return estoqueService.update(idMaterial, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{idMaterial}")
    public ResponseEntity<Void> deleteEstoque(@PathVariable Long idMaterial) {
        return estoqueService.delete(idMaterial)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
