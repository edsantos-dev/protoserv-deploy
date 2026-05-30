package com.protoserv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.protoserv.model.Servico;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {

}
