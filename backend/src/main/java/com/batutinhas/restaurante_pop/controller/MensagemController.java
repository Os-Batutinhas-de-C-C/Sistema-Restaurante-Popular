package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.MensagemCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.MensagemResponseDTO;
import com.batutinhas.restaurante_pop.dto.MensagemUpdateRequestDTO;
import com.batutinhas.restaurante_pop.service.MensagemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {
    private final MensagemService mensagemService;

    public MensagemController(MensagemService mensagemService) {
        this.mensagemService = mensagemService;
    }

    @GetMapping
    public ResponseEntity<List<MensagemResponseDTO>> getAllMensagens() {
        return ResponseEntity.ok(mensagemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MensagemResponseDTO> getMensagemById(@PathVariable Long id) {
        return mensagemService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<MensagemResponseDTO> createMensagem(
            @PathVariable Long usuarioId,
            @RequestBody MensagemCreateRequestDTO request
    ) {
        return mensagemService.create(usuarioId, request)
                .map(saved -> ResponseEntity.ok(saved))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MensagemResponseDTO> updateMensagem(
            @PathVariable Long id,
            @RequestBody MensagemUpdateRequestDTO request
    ) {
        return mensagemService.update(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMensagem(@PathVariable Long id) {
        if (mensagemService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
