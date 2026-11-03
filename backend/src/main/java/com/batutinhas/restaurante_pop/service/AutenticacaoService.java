package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class AutenticacaoService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public AutenticacaoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmailRecuperacao(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

        SimpleGrantedAuthority permissao = new SimpleGrantedAuthority(
                "ROLE_" + UsuarioPapel.role(usuario.getTipo())
        );

        return new org.springframework.security.core.userdetails.User(
                usuario.getEmailRecuperacao(),
                usuario.getCredencialAutenticacao().getPasswordHash(),
                Collections.singletonList(permissao)
        );
    }
}
