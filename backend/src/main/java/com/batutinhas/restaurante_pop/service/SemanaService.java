package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.RefeicaoRequestDTO;
import com.batutinhas.restaurante_pop.dto.RefeicaoResponseDTO;
import com.batutinhas.restaurante_pop.dto.CardapioPublicoResponseDTO;
import com.batutinhas.restaurante_pop.dto.SemanaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.SemanaResponseDTO;
import com.batutinhas.restaurante_pop.dto.SemanaUpdateRequestDTO;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SemanaService {
    private final SemanaRepository semanaRepository;
    private final RefeicaoRepository refeicaoRepository;

    public SemanaService(SemanaRepository semanaRepository, RefeicaoRepository refeicaoRepository) {
        this.semanaRepository = semanaRepository;
        this.refeicaoRepository = refeicaoRepository;
    }

    @Transactional(readOnly = true)
    public List<SemanaResponseDTO> findAll() {
        return semanaRepository.findAllByOrderByDataAsc().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CardapioPublicoResponseDTO> findAllPublic() {
        return semanaRepository.findAllByOrderByDataAsc().stream()
                .map(semana -> new CardapioPublicoResponseDTO(
                        semana.getData(),
                        toMealResponseList(semana.getCardapio())
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public SemanaResponseDTO create(SemanaCreateRequestDTO request) {
        requireMonday(request.data());
        if (semanaRepository.existsByData(request.data())) {
            throw new IllegalArgumentException("J\u00e1 existe um card\u00e1pio cadastrado para esta semana.");
        }
        Semana semana = new Semana();
        semana.setData(request.data());
        semana.setDesperdicio(copyList(request.desperdicio()));
        semana.setFichasVendidas(copyList(request.fichasVendidas()));
        replaceCardapio(semana, request.cardapio());
        return toResponseDTO(semanaRepository.save(semana));
    }

    @Transactional
    public Optional<SemanaResponseDTO> update(LocalDate data, SemanaUpdateRequestDTO request) {
        requireMonday(data);
        return semanaRepository.findByData(data).map(semana -> {
            semana.setDesperdicio(copyList(request.desperdicio()));
            semana.setFichasVendidas(copyList(request.fichasVendidas()));
            replaceCardapio(semana, request.cardapio());
            return toResponseDTO(semanaRepository.save(semana));
        });
    }

    private void replaceCardapio(Semana semana, List<RefeicaoRequestDTO> requestItems) {
        List<RefeicaoRequestDTO> items = requestItems == null
                ? new ArrayList<>(Collections.nCopies(Semana.QUANTIDADE_DIAS_UTEIS, null))
                : requestItems;
        if (items.size() != Semana.QUANTIDADE_DIAS_UTEIS) {
            throw new IllegalArgumentException("O cardápio semanal deve ter exatamente cinco posições.");
        }

        List<Refeicao> refeicoes = new ArrayList<>(Collections.nCopies(Semana.QUANTIDADE_DIAS_UTEIS, null));
        for (int posicao = 0; posicao < items.size(); posicao++) {
            RefeicaoRequestDTO item = items.get(posicao);
            if (item != null) refeicoes.set(posicao, resolveRefeicao(item));
        }
        List<Refeicao> mealsWithoutDuplicates = new ArrayList<>();
        for (Refeicao refeicao : refeicoes) {
            if (refeicao != null && mealsWithoutDuplicates.contains(refeicao)) {
                throw new IllegalArgumentException("A mesma refeição não pode ocupar mais de uma posição na semana.");
            }
            if (refeicao != null) mealsWithoutDuplicates.add(refeicao);
        }
        semana.setCardapio(refeicoes);
    }

    private Refeicao resolveRefeicao(RefeicaoRequestDTO item) {
        if (item.idRefeicao() != null) {
            if (item.hasMealFields()) {
                throw new IllegalArgumentException("Uma referência de refeição não pode incluir campos de criação.");
            }
            return refeicaoRepository.findById(item.idRefeicao())
                    .orElseThrow(() -> new EntityNotFoundException("Refeição não encontrada."));
        }

        Refeicao refeicao = new Refeicao();
        refeicao.setProteina(RequestValidation.text(item.proteina(), "proteina", 255));
        refeicao.setGuarnicao(RequestValidation.text(item.guarnicao(), "guarnicao", 255));
        refeicao.setSaladaDoDia(RequestValidation.text(item.saladaDoDia(), "saladaDoDia", 255));
        refeicao.setAcompanhamento1(RequestValidation.text(item.acompanhamento1(), "acompanhamento1", 255));
        refeicao.setAcompanhamento2(RequestValidation.text(item.acompanhamento2(), "acompanhamento2", 255));
        refeicao.setSuco(RequestValidation.text(item.suco(), "suco", 255));
        refeicao.setSobremesa(RequestValidation.text(item.sobremesa(), "sobremesa", 255));
        refeicao.setOpcaoProteica(RequestValidation.text(item.opcaoProteica(), "opcaoProteica", 255));
        refeicao.setCalorias(item.calorias() == null ? 0 : item.calorias());
        return refeicao;
    }

    private SemanaResponseDTO toResponseDTO(Semana semana) {
        List<RefeicaoResponseDTO> cardapio = toMealResponseList(semana.getCardapio());

        return new SemanaResponseDTO(
                semana.getIdSemana(),
                semana.getData(),
                safeList(semana.getDesperdicio()),
                safeList(semana.getFichasVendidas()),
                cardapio
        );
    }

    private RefeicaoResponseDTO toResponseDTO(Refeicao refeicao) {
        return new RefeicaoResponseDTO(
                refeicao.getIdRefeicao(),
                refeicao.getProteina(),
                refeicao.getGuarnicao(),
                refeicao.getAcompanhamento1(),
                refeicao.getAcompanhamento2(),
                refeicao.getSuco(),
                refeicao.getSobremesa(),
                refeicao.getOpcaoProteica(),
                refeicao.getCalorias(),
                refeicao.getSaladaDoDia()
        );
    }

    private List<RefeicaoResponseDTO> toMealResponseList(List<Refeicao> refeicoes) {
        List<RefeicaoResponseDTO> result = new ArrayList<>(Semana.QUANTIDADE_DIAS_UTEIS);
        for (Refeicao refeicao : refeicoes) {
            result.add(refeicao == null ? null : toResponseDTO(refeicao));
        }
        return result;
    }

    private void requireMonday(LocalDate data) {
        if (data == null || data.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("A data da semana deve ser uma segunda-feira.");
        }
    }

    private static <T> List<T> copyList(List<T> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : new ArrayList<>(values);
    }
}
