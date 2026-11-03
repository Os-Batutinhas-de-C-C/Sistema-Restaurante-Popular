package com.batutinhas.restaurante_pop.factory;

import com.batutinhas.restaurante_pop.dto.UsuarioCreateRequestDTO;
import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;

public final class UsuarioFactory {
    private UsuarioFactory() {
    }

    public static UsuarioCreateRequestDTO criarUsuarioCreateRequestDTO() {
        return new UsuarioCreateRequestDTO(
                "Joao Nutricionista",
                "joao@restaurante.com",
                'N',
                "senha123"
        );
    }

    public static UsuarioCreateRequestDTO criarRequestSemNome() {
        UsuarioCreateRequestDTO request = criarUsuarioCreateRequestDTO();
        return new UsuarioCreateRequestDTO(null, request.emailRecuperacao(), request.tipo(), request.senhaPura());
    }

    public static UsuarioCreateRequestDTO criarRequestSemEmail() {
        UsuarioCreateRequestDTO request = criarUsuarioCreateRequestDTO();
        return new UsuarioCreateRequestDTO(request.nome(), null, request.tipo(), request.senhaPura());
    }

    public static Usuario criarUsuarioEntidadeValido() {
        return criarUsuarioEntidadeValido("joao@restaurante.com", 'N');
    }

    public static Usuario criarUsuarioEntidadeValido(String email, char tipo) {
        Usuario usuario = new Usuario();
        usuario.setNome(tipo == 'N' ? "Nutricionista de Teste" : "Caixa de Teste");
        usuario.setEmailRecuperacao(email);
        usuario.setTipo(tipo);

        CredencialAutenticacao credencial = CredencialFactory.criarCredencialValida(usuario);
        usuario.setCredencialAutenticacao(credencial);
        return usuario;
    }
}