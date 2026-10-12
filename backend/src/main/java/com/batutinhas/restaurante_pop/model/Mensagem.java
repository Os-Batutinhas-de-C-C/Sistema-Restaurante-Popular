package com.batutinhas.restaurante_pop.model;

import java.time.LocalDateTime;

public class Mensagem {
    private long idMensagem;
    private String texto;
    private LocalDateTime dataHora;

    public Mensagem() {
        
    }

    public long getIdMensagem() {
        return idMensagem;
    }

    public String getTexto() {
        return texto;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }
}
