package com.protoserv.repository;

import com.protoserv.model.Servico;
import com.protoserv.model.Solicitacao;
import com.protoserv.model.StatusSolicitacao;
import com.protoserv.model.Usuario;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
    
    Optional<Solicitacao> findFirstByCidadaoAndServicoAndStatusNotInOrderByDataAberturaDesc(
            Usuario cidadao, 
            Servico servico, 
            List<StatusSolicitacao> statusFinais
    );

    Page<Solicitacao> findAllByStatus(StatusSolicitacao status, Pageable pageable);
}