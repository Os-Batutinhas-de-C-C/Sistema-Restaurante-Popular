package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.batutinhas.restaurante_pop.model.Semana;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;

public interface SemanaRepository extends JpaRepository<Semana, Long> {
    Optional<Semana> findByData(LocalDate data);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select semana from Semana semana where semana.data = :data")
    Optional<Semana> findByDataForUpdate(@Param("data") LocalDate data);

    List<Semana> findAllByOrderByDataAsc();
}
