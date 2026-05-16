package com.protoserv.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.protoserv.model.StatusUsuario;
import com.protoserv.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndStatus(String email, StatusUsuario status);

    Page<Usuario> findByStatus(StatusUsuario status, Pageable pageable);
}
