package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.DesperdicioDiaResponseDTO;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class DesperdicioService {
    private static final ZoneId ZONA_NEGOCIO = ZoneId.of("America/Fortaleza");
    private final SemanaRepository semanaRepository;
    private final Clock clock;

    public DesperdicioService(SemanaRepository semanaRepository, @Qualifier("fichasClock") Clock clock) {
        this.semanaRepository = semanaRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DesperdicioDiaResponseDTO consultarHoje() {
        LocalDate hoje = LocalDate.ofInstant(clock.instant(), ZONA_NEGOCIO);
        int indice = hoje.getDayOfWeek().getValue() - 1;
        if (indice >= Semana.QUANTIDADE_DIAS_UTEIS) {
            return new DesperdicioDiaResponseDTO(hoje, null);
        }

        Double valor = semanaRepository.findByData(hoje.minusDays(indice))
                .map(Semana::getDesperdicio)
                .filter(valores -> indice < valores.size())
                .map(valores -> valores.get(indice))
                .orElse(null);
        return new DesperdicioDiaResponseDTO(hoje, valor);
    }
}
