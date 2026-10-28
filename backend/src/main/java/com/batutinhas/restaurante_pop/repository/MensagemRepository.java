package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.batutinhas.restaurante_pop.model.Mensagem;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

}
