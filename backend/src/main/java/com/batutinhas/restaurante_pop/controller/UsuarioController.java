package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import com.batutinhas.restaurante_pop.model.*;


import java.util.List;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;


@RestController 
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping 
    public List<Usuario> getUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping 
    public Usuario createUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}
