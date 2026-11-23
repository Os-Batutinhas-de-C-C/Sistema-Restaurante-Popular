package com.batutinhas.restaurante_pop.dto;

import com.batutinhas.restaurante_pop.model.EventoOficina.Custo;
import com.batutinhas.restaurante_pop.model.EventoOficina.Tipo;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public final class OficinaDTO {
    private OficinaDTO() {}

    public enum Estado { PROGRAMADO, EM_ANDAMENTO, ENCERRADO }

    public record EventoRequest(String title, Tipo tipo, String vagas, String descricao, LocalDate data,
                                LocalTime horaInicio, LocalTime horaFim, String local, String instrutor, Custo custo,
                                Long versao, String confirmacao) {}

    public record Evento(Long id, String title, Tipo tipo, String vagas, String vagasRestantes, String descricao,
                         LocalDate data, LocalTime horaInicio, LocalTime horaFim, String local, String instrutor,
                         Custo custo, Estado estado, Instant inicioEm, Instant fimEm) {}

    public record EventoGestao(Evento evento, long versao, Instant agora) {}
    public record Agenda(Instant agora, List<Evento> eventos) {}

    public record InscricaoRequest(String cpf, LocalDate dataNascimento, String email) {
        @Override public String toString() { return "InscricaoRequest"; }
    }

    public record IdentidadeRequest(String cpf, LocalDate dataNascimento) {
        @Override public String toString() { return "IdentidadeRequest"; }
    }

    public record Inscrito(Long id, String cpf, LocalDate dataNascimento, String email) {
        @Override public String toString() { return "Inscrito"; }
    }

    public record Inscritos(Instant agora, Instant inicioEm, List<Inscrito> inscricoes) {
        @Override public String toString() { return "Inscritos"; }
    }

    public record ConfirmacaoReagendamento(String code, String message, int quantidade, String confirmacao) {}
}
