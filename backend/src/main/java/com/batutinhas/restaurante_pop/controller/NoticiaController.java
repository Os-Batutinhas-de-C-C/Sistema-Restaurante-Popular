package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.NoticiaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.NoticiaResponseDTO;
import com.batutinhas.restaurante_pop.service.NoticiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {
    private final NoticiaService noticiaService;

    public NoticiaController(NoticiaService noticiaService) {
        this.noticiaService = noticiaService;
    }

    @GetMapping
    public List<NoticiaResponseDTO> getNoticias() {
        return noticiaService.findAll();
    }

    @PostMapping
    public ResponseEntity<NoticiaResponseDTO> createNoticia(
            @RequestBody NoticiaCreateRequestDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(noticiaService.create(request, authentication.getName()));
    }
}
