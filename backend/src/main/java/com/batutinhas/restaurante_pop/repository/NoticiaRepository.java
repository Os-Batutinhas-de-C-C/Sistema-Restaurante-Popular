package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.batutinhas.restaurante_pop.model.Noticia;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {

}
