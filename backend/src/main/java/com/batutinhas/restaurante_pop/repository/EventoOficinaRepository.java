package com.batutinhas.restaurante_pop.repository;

import com.batutinhas.restaurante_pop.model.EventoOficina;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface EventoOficinaRepository extends JpaRepository<EventoOficina, Long>,
        JpaSpecificationExecutor<EventoOficina> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from EventoOficina e where e.id = :id")
    Optional<EventoOficina> findByIdForUpdate(@Param("id") long id);

    @Query("""
            select e from EventoOficina e
            where e.data > :data or (e.data = :data and e.horaFim > :hora)
            order by e.data, e.horaInicio, e.id
            """)
    List<EventoOficina> listarProgramacao(@Param("data") LocalDate data, @Param("hora") LocalTime hora);
}
