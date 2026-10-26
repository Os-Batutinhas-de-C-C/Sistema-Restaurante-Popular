package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;

import java.util.List;

    
@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {
    private final MensagemRepository mensagemRepository;

    public MensagemController(MensagemRepository mensagemRepository) {
        this.mensagemRepository = mensagemRepository;
    }

    @GetMapping
    public List<Mensagem> getMensagens() {
        return mensagemRepository.findAll();
    }

    @PostMapping
    public Mensagem createMensagem(@RequestBody Mensagem mensagem) {    
        return mensagemRepository.save(mensagem);
    }
}
