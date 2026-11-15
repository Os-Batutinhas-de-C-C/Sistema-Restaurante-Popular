package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.FichasDiaResponseDTO;
import com.batutinhas.restaurante_pop.exception.FichasException;
import com.batutinhas.restaurante_pop.model.Semana;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class FichasService {
    public static final int CAPACIDADE_DIARIA = 300;
    private static final ZoneId ZONA_NEGOCIO = ZoneId.of("America/Fortaleza");
    private final FichasTransacaoService transacoes;
    private final Clock clock;

    public FichasService(FichasTransacaoService transacoes, @Qualifier("fichasClock") Clock clock) {
        this.transacoes = transacoes;
        this.clock = clock;
    }

    public FichasDiaResponseDTO consultarHoje() {
        LocalDate hoje = LocalDate.ofInstant(clock.instant(), ZONA_NEGOCIO);
        return diaUtil(hoje) ? transacoes.consultar(hoje) : FichasTransacaoService.resposta(hoje, 0);
    }

    public FichasDiaResponseDTO incrementarHoje() {
        LocalDate hoje = LocalDate.ofInstant(clock.instant(), ZONA_NEGOCIO);
        if (!diaUtil(hoje)) {
            throw new FichasException("FICHAS_CLOSED_DAY", "A entrega de fichas ocorre de segunda a sexta-feira.");
        }
        var existente = transacoes.incrementar(hoje);
        if (existente.isPresent()) return existente.get();

        // A criação usa outra transação: uma colisão na data não invalida a nova tentativa.
        try {
            transacoes.criarSemanaVazia(FichasTransacaoService.segundaFeira(hoje));
        } catch (DataIntegrityViolationException exception) {
            return transacoes.incrementar(hoje).orElseThrow(() -> exception);
        }
        return transacoes.incrementar(hoje)
                .orElseThrow(() -> new IllegalStateException("Não foi possível localizar a semana de atendimento."));
    }

    private static boolean diaUtil(LocalDate data) {
        return data.getDayOfWeek().getValue() <= Semana.QUANTIDADE_DIAS_UTEIS;
    }
}
