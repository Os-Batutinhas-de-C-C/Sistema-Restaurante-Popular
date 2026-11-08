package com.batutinhas.restaurante_pop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import com.batutinhas.restaurante_pop.model.Usuario;
import org.springframework.stereotype.Repository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmailRecuperacao(String emailRecuperacao);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Usuario u where u.id_usuario = :id")
    Optional<Usuario> findForProfileUpdate(@Param("id") long id);
}
