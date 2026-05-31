package com.protoserv.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.protoserv.model.Servico;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {
    
    Optional<Servico> findByNome(String nome);

    Page<Servico> findByAtivoTrueAndNomeContainingIgnoreCase(String nome, Pageable paginacao);
}
