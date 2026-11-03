package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.batutinhas.restaurante_pop.model.Semana;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;

public interface SemanaRepository extends JpaRepository<Semana, Long> {
    Optional<Semana> findByData(LocalDate data);

    boolean existsByData(LocalDate data);

    List<Semana> findAllByOrderByDataAsc();
}
