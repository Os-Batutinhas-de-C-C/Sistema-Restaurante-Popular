package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.batutinhas.restaurante_pop.model.*;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import com.batutinhas.restaurante_pop.service.UsuarioService;

import java.util.List;

@RestController 
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = new UsuarioService();
    }

    @GetMapping 
    public List<Usuario> getUsuarios() {
        return usuarioRepository.findAll();
    }

    public record RegistroUsuarioDTO(String nome, String emailRecuperacao, char tipo, String senhaPura) {}

    @PostMapping 
    public Usuario createUsuario(@RequestBody RegistroUsuarioDTO registroDTO) {
        Usuario novoUsuario = usuarioService.registrarUsuario(
                registroDTO.nome(),
                registroDTO.emailRecuperacao(),
                registroDTO.tipo(),
                registroDTO.senhaPura()
        );
        return ResponseEntity.ok(novoUsuario).getBody();
    }
}
