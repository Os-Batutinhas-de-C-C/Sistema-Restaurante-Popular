package com.batutinhas.restaurante_pop.model;

import com.batutinhas.restaurante_pop.factory.MensagemFactory;
import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/** RF012: as duas pontas da relação devem concordar ao adicionar ou retirar mensagens. */
@DisplayName("RF012 — Relação entre usuário e mensagem")
class UsuarioTest {
    @Test
    @DisplayName("Adicionar mensagem inclui na coleção e aponta o autor de volta ao usuário")
    void adicionarEstabeleceAmbosOsLados() {
        var usuario = UsuarioFactory.criarUsuarioEntidadeValido();
        var mensagem = MensagemFactory.criarMensagemEntidadeValida(null);

        usuario.addMensagem(mensagem);

        assertThat(usuario.getMensagens()).containsExactly(mensagem);
        assertThat(mensagem.getUsuario()).isSameAs(usuario);
    }

    @Test
    @DisplayName("Retirar uma mensagem limpa seu autor e preserva as demais mensagens")
    void removerLimpaAmbosOsLadosSemAfetarOutraMensagem() {
        var usuario = UsuarioFactory.criarUsuarioEntidadeValido();
        var removida = MensagemFactory.criarMensagemEntidadeValida(null);
        var mantida = MensagemFactory.criarMensagemEntidadeValida(null);
        usuario.addMensagem(removida);
        usuario.addMensagem(mantida);

        usuario.removeMensagem(removida);

        assertThat(usuario.getMensagens()).containsExactly(mantida);
        assertThat(removida.getUsuario()).isNull();
        assertThat(mantida.getUsuario()).isSameAs(usuario);
    }
}
