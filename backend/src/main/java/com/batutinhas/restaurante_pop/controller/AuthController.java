package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // A ferramenta que criptografa e compara senhas

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record LoginDTO(String email, String senha) {}

    @PostMapping("/login")
    public ResponseEntity<String> realizarLogin(@RequestBody LoginDTO dadosLogin) {
        
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmailRecuperacao(dadosLogin.email());

        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Usuário não encontrado.");
        }

        Usuario usuarioEncontrado = usuarioOptional.get();

        String hashSalvoNoBanco = usuarioEncontrado.getCredencialAutenticacao().getPasswordHash();

        boolean senhaCorreta = passwordEncoder.matches(dadosLogin.senha(), hashSalvoNoBanco);

        if (senhaCorreta) {
            return ResponseEntity.ok("Login aprovado! Bem-vindo(a), " + usuarioEncontrado.getNome());
        } else {
            return ResponseEntity.status(401).body("Senha incorreta.");
        }
    }
}