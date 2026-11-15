package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/** RF012: protege os dados e a autoridade entregues ao carregador de usuários legado. */
@ExtendWith(MockitoExtension.class)
@DisplayName("RF012 — Carregamento de usuário para autenticação")
class AutenticacaoServiceTest {
    @Mock private UsuarioRepository usuarios;

    @ParameterizedTest(name = "tipo {0} produz somente {1}")
    @CsvSource({"N,ROLE_NUTRICIONISTA", "C,ROLE_CAIXA", "G,ROLE_GESTOR", "n,ROLE_NUTRICIONISTA", "X,ROLE_USUARIO_COMUM"})
    @DisplayName("Mantém e-mail/hash armazenados e concede exatamente a autoridade do papel")
    void carregarUsuarioPreservaCredenciaisEAutoridade(char tipo, String autoridade) {
        var usuario = UsuarioFactory.criarUsuarioEntidadeValido("conta@example.test", tipo);
        when(usuarios.findByEmailRecuperacao(usuario.getEmailRecuperacao())).thenReturn(Optional.of(usuario));

        var resultado = new AutenticacaoService(usuarios).loadUserByUsername(usuario.getEmailRecuperacao());

        assertThat(resultado.getUsername()).isEqualTo(usuario.getEmailRecuperacao());
        assertThat(resultado.getPassword()).isEqualTo(usuario.getCredencialAutenticacao().getPasswordHash());
        assertThat(resultado.getAuthorities()).extracting("authority").containsExactly(autoridade);
    }

    @Test
    @DisplayName("Conta inexistente impede criar um UserDetails autenticável")
    void contaInexistenteLancaUsernameNotFound() {
        when(usuarios.findByEmailRecuperacao("ausente@example.test")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new AutenticacaoService(usuarios).loadUserByUsername("ausente@example.test"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
