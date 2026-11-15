package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.FichasDiaResponseDTO;
import com.batutinhas.restaurante_pop.exception.FichasException;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FichasTransacaoService {
    private final SemanaRepository semanaRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public FichasTransacaoService(SemanaRepository semanaRepository) {
        this.semanaRepository = semanaRepository;
    }

    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public FichasDiaResponseDTO consultar(LocalDate data) {
        entityManager.clear();
        int entregues = semanaRepository.findByData(segundaFeira(data))
                .map(semana -> contagem(semana, posicao(data)))
                .orElse(0);
        return resposta(data, entregues);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<FichasDiaResponseDTO> incrementar(LocalDate data) {
        // OpenEntityManagerInView pode conservar a coleção entre as transações de criação e incremento.
        entityManager.clear();
        return semanaRepository.findByDataForUpdate(segundaFeira(data)).map(semana -> {
            int indice = posicao(data);
            int entregues = contagem(semana, indice);
            if (entregues >= FichasService.CAPACIDADE_DIARIA) {
                throw new FichasException("FICHAS_LIMIT_REACHED",
                        "O limite de 300 fichas entregues hoje foi atingido.");
            }
            List<Integer> fichas = semana.getFichasVendidas();
            if (fichas == null) {
                fichas = new ArrayList<>();
                semana.setFichasVendidas(fichas);
            }
            while (fichas.size() <= indice) fichas.add(0);
            fichas.set(indice, entregues + 1);
            return resposta(data, entregues + 1);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void criarSemanaVazia(LocalDate segundaFeira) {
        Semana semana = new Semana();
        semana.setData(segundaFeira);
        semana.setCardapio(null);
        semanaRepository.saveAndFlush(semana);
    }

    static LocalDate segundaFeira(LocalDate data) {
        return data.minusDays(posicao(data));
    }

    private static int posicao(LocalDate data) {
        return data.getDayOfWeek().getValue() - 1;
    }

    private static int contagem(Semana semana, int indice) {
        List<Integer> fichas = semana.getFichasVendidas();
        if (fichas == null || fichas.size() <= indice || fichas.get(indice) == null) return 0;
        int entregues = fichas.get(indice);
        if (entregues < 0) {
            throw new FichasException("FICHAS_INVALID_DATA",
                    "A contagem de fichas deste dia é inválida. Solicite a conferência dos dados.");
        }
        return entregues;
    }

    static FichasDiaResponseDTO resposta(LocalDate data, int entregues) {
        int restantes = Math.max(0, FichasService.CAPACIDADE_DIARIA - entregues);
        return new FichasDiaResponseDTO(data, entregues, FichasService.CAPACIDADE_DIARIA,
                restantes, data.getDayOfWeek().getValue() <= Semana.QUANTIDADE_DIAS_UTEIS && restantes > 0);
    }
}
