package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario registrarUsuario(String nome, String email, char tipo, String senhaPura) {
        
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(nome);
        novoUsuario.setEmailRecuperacao(email);
        novoUsuario.setTipo(tipo);

        CredencialAutenticacao credencial = new CredencialAutenticacao();
        
        String hashSeguro = passwordEncoder.encode(senhaPura);
        credencial.setPasswordHash(hashSeguro); 
        
        credencial.setDataCriacao(LocalDate.now());
        credencial.setTentativasFalhas(0);

        credencial.setUsuario(novoUsuario);
        novoUsuario.setCredencialAutenticacao(credencial);

        return usuarioRepository.save(novoUsuario);
    }
}
