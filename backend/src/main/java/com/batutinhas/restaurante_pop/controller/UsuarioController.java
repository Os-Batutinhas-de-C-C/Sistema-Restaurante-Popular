package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController 
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class UsuarioController {
    private final List<Usuario> usuarios = new ArrayList<>();
    private final AtomicLong geraId = new AtomicLong(3);

    public UsuarioController() {
        usuarios.add(new Usuario(1L, "Maria", "nutri@email.com", 'n'));
        usuarios.add(new Usuario(2L, "Mario", "nutri@email", 'n'));
        usuarios.add(new Usuario(3L, "Joao", "caixa@email.com", 'c'));
    }

    @GetMapping 
    public List<Usuario> getUsuarios() {
        return usuarios;
    }
}
