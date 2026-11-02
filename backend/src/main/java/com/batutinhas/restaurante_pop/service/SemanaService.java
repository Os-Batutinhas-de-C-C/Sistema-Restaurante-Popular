package com.batutinhas.restaurante_pop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.model.Semana;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class SemanaService {
    
    @Autowired
    private SemanaRepository semanaRepository;

    public Optional<Semana> findByData(LocalDate data) {
        return semanaRepository.findByData(data);
    }
}
