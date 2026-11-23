package com.batutinhas.restaurante_pop.repository;

import com.batutinhas.restaurante_pop.model.EventoOficina;
import com.batutinhas.restaurante_pop.model.InscricaoOficina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface InscricaoOficinaRepository extends JpaRepository<InscricaoOficina, Long> {
    interface Contagem {
        Long getEventoId();
        long getTotal();
    }

    long countByEventoId(long eventoId);
    boolean existsByEventoIdAndCpf(long eventoId, String cpf);
    List<InscricaoOficina> findAllByEventoIdOrderByIdAsc(long eventoId);
    Optional<InscricaoOficina> findByIdAndEventoId(long id, long eventoId);
    Optional<InscricaoOficina> findByEventoIdAndCpfAndDataNascimento(long eventoId, String cpf, LocalDate dataNascimento);

    @Query("""
            select i.evento.id as eventoId, count(i) as total from InscricaoOficina i
            where i.evento.id in :eventos group by i.evento.id
            """)
    List<Contagem> contarPorEvento(@Param("eventos") Collection<Long> eventos);

    @Query("""
            select e from InscricaoOficina i join i.evento e
            where i.cpf = :cpf and i.dataNascimento = :nascimento
              and (e.data > :data or (e.data = :data and e.horaFim > :hora))
            order by e.data, e.horaInicio, e.id
            """)
    List<EventoOficina> consultarProprias(@Param("cpf") String cpf, @Param("nascimento") LocalDate nascimento,
                                        @Param("data") LocalDate data, @Param("hora") LocalTime hora);

    @Query("""
            select distinct i.cpf from InscricaoOficina i join i.evento e
            where i.cpf in :cpfs and e.id <> :eventoId and e.data = :data
              and e.horaInicio < :fim and e.horaFim > :inicio
            """)
    List<String> buscarCpfsEmConflito(@Param("cpfs") Collection<String> cpfs, @Param("eventoId") long eventoId,
                                     @Param("data") LocalDate data, @Param("inicio") LocalTime inicio,
                                     @Param("fim") LocalTime fim);
}
