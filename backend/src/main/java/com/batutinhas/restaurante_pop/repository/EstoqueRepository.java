package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.batutinhas.restaurante_pop.model.Estoque;


public interface EstoqueRepository extends JpaRepository<Estoque, Long> {

}
