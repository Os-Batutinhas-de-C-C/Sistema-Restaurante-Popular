package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.batutinhas.restaurante_pop.model.Refeicao;
import java.util.Optional;

public interface RefeicaoRepository extends JpaRepository<Refeicao, Long> {
    @Query("""
            select refeicao from Refeicao refeicao
            where coalesce(refeicao.proteina, '') = coalesce(:proteina, '')
              and coalesce(refeicao.guarnicao, '') = coalesce(:guarnicao, '')
              and coalesce(refeicao.acompanhamento1, '') = coalesce(:acompanhamento1, '')
              and coalesce(refeicao.acompanhamento2, '') = coalesce(:acompanhamento2, '')
              and coalesce(refeicao.suco, '') = coalesce(:suco, '')
              and coalesce(refeicao.sobremesa, '') = coalesce(:sobremesa, '')
              and coalesce(refeicao.opcao_proteica, '') = coalesce(:opcaoProteica, '')
              and coalesce(refeicao.salada_do_dia, '') = coalesce(:saladaDoDia, '')
            """)
    Optional<Refeicao> findByComposicao(
            @Param("proteina") String proteina,
            @Param("guarnicao") String guarnicao,
            @Param("acompanhamento1") String acompanhamento1,
            @Param("acompanhamento2") String acompanhamento2,
            @Param("suco") String suco,
            @Param("sobremesa") String sobremesa,
            @Param("opcaoProteica") String opcaoProteica,
            @Param("saladaDoDia") String saladaDoDia
    );
}
