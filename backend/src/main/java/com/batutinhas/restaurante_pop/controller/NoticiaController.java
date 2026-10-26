package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;

import java.util.List;

public class NoticiaController {
    private final NoticiaRepository noticiaRepository;

    public NoticiaController(NoticiaRepository noticiaRepository) {
        this.noticiaRepository = noticiaRepository;
    }

    @GetMapping
    public List<Noticia> getNoticias() {
        return noticiaRepository.findAll();
    }

    @PostMapping
    public Noticia createNoticia(@RequestBody Noticia noticia) {
        return noticiaRepository.save(noticia);
    }

}
