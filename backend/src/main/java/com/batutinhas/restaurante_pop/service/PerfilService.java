package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.PerfilUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.PerfilUpdateResponseDTO;
import com.batutinhas.restaurante_pop.dto.SenhaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.dto.UsuarioResponseDTO;
import com.batutinhas.restaurante_pop.exception.PerfilException;
import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
public class PerfilService {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+$");
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PerfilService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO consultar(long idUsuario) {
        return response(usuarioRepository.findById(idUsuario).orElseThrow(this::naoEncontrado));
    }

    @Transactional
    public PerfilUpdateResponseDTO atualizar(long idUsuario, long tokenVersion, PerfilUpdateRequestDTO request) {
        if (request == null) throw invalido("Os dados do perfil são obrigatórios.");
        String nome = texto(request.nome(), "Nome");
        String email = texto(request.emailRecuperacao(), "E-mail");
        if (!EMAIL.matcher(email).matches()) throw invalido("Informe um e-mail válido.");

        Usuario usuario = usuarioParaAtualizar(idUsuario, tokenVersion);
        boolean emailAlterado = !Objects.equals(email, usuario.getEmailRecuperacao());
        if (emailAlterado) {
            conferirSenhaAtual(request.senhaAtual(), usuario.getCredencialAutenticacao());
            boolean emUso = usuarioRepository.findByEmailRecuperacao(email)
                    .filter(outro -> outro.getIdUsuario() != usuario.getIdUsuario()).isPresent();
            if (emUso) throw emailEmUso();
        }

        usuario.setNome(nome);
        usuario.setEmailRecuperacao(email);
        if (emailAlterado) usuario.getCredencialAutenticacao().incrementarVersaoToken();
        try {
            usuarioRepository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException exception) {
            throw emailEmUso();
        }
        return new PerfilUpdateResponseDTO(response(usuario), emailAlterado);
    }

    @Transactional
    public void alterarSenha(long idUsuario, long tokenVersion, SenhaUpdateRequestDTO request) {
        if (request == null) throw invalido("Os dados da alteração de senha são obrigatórios.");
        String novaSenha = request.novaSenha();
        if (novaSenha == null || novaSenha.isBlank()
                || novaSenha.codePointCount(0, novaSenha.length()) < 6) {
            throw invalido("A nova senha deve ter pelo menos 6 caracteres.");
        }
        if (novaSenha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw invalido("A nova senha deve ter no máximo 72 bytes em UTF-8.");
        }
        if (!novaSenha.equals(request.confirmacaoSenha())) {
            throw invalido("A confirmação deve ser igual à nova senha.");
        }

        Usuario usuario = usuarioParaAtualizar(idUsuario, tokenVersion);
        CredencialAutenticacao credencial = usuario.getCredencialAutenticacao();
        conferirSenhaAtual(request.senhaAtual(), credencial);
        credencial.setPasswordHash(passwordEncoder.encode(novaSenha));
        credencial.incrementarVersaoToken();
        usuarioRepository.saveAndFlush(usuario);
    }

    private Usuario usuarioParaAtualizar(long idUsuario, long tokenVersion) {
        Usuario usuario = usuarioRepository.findForProfileUpdate(idUsuario).orElseThrow(this::naoEncontrado);
        CredencialAutenticacao credencial = usuario.getCredencialAutenticacao();
        if (credencial == null || credencial.getVersaoToken() != tokenVersion) {
            throw new PerfilException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Entre novamente para continuar.");
        }
        return usuario;
    }

    private void conferirSenhaAtual(String senhaAtual, CredencialAutenticacao credencial) {
        if (senhaAtual == null || senhaAtual.isBlank()
                || senhaAtual.getBytes(StandardCharsets.UTF_8).length > 72
                || !passwordEncoder.matches(senhaAtual, credencial.getPasswordHash())) {
            throw new PerfilException(HttpStatus.BAD_REQUEST, "CURRENT_PASSWORD_INVALID", "A senha atual não confere.");
        }
    }

    private String texto(String value, String field) {
        if (value == null || value.isBlank()) throw invalido(field + " é obrigatório.");
        String normalized = value.trim();
        if (normalized.codePointCount(0, normalized.length()) > 255) {
            throw invalido(field + " deve ter no máximo 255 caracteres.");
        }
        return normalized;
    }

    private UsuarioResponseDTO response(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getIdUsuario(), usuario.getNome(),
                usuario.getEmailRecuperacao(), usuario.getTipo());
    }

    private PerfilException invalido(String message) {
        return new PerfilException(HttpStatus.BAD_REQUEST, "PROFILE_VALIDATION_ERROR", message);
    }

    private PerfilException emailEmUso() {
        return new PerfilException(HttpStatus.CONFLICT, "EMAIL_IN_USE", "Este e-mail já está em uso.");
    }

    private PerfilException naoEncontrado() {
        return new PerfilException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "Perfil não encontrado.");
    }
}
