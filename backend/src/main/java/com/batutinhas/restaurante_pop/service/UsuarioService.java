package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.UsuarioCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.UsuarioResponseDTO;
import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponseDTO registrarUsuario(UsuarioCreateRequestDTO request) {
        if (request == null || request.tipo() == null) {
            throw new IllegalArgumentException("Os dados do usuário são obrigatórios.");
        }

        String nome = RequestValidation.requiredText(request.nome(), "nome", 255);
        String email = RequestValidation.requiredText(request.emailRecuperacao(), "emailRecuperacao", 255);
        String senhaPura = RequestValidation.requiredText(request.senhaPura(), "senhaPura", Integer.MAX_VALUE);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(nome);
        novoUsuario.setEmailRecuperacao(email);
        novoUsuario.setTipo(request.tipo());

        CredencialAutenticacao credencial = new CredencialAutenticacao();
        String hashSeguro = passwordEncoder.encode(senhaPura);
        credencial.setPasswordHash(hashSeguro);
        credencial.setDataCriacao(LocalDate.now());
        credencial.setTentativasFalhas(0);

        credencial.setUsuario(novoUsuario);
        novoUsuario.setCredencialAutenticacao(credencial);

        return toResponseDTO(usuarioRepository.save(novoUsuario));
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmailRecuperacao(),
                usuario.getTipo()
        );
    }
}
