package com.protoserv.dto.response;

import com.protoserv.model.Solicitacao;
import java.time.LocalDateTime;

public record DadosListagemSolicitacaoDTO(
        Long id,
        String protocolo,
        String servicoNome,
        String cidadaoNome,
        String status,
        String prioridade,
        LocalDateTime dataAbertura
) {
    public DadosListagemSolicitacaoDTO(Solicitacao solicitacao) {
        this(
                solicitacao.getId(),
                solicitacao.getProtocolo(),
                solicitacao.getServico().getNome(),
                solicitacao.getCidadao().getNome(),
                solicitacao.getStatus().name(),
                solicitacao.getPrioridade().name(),
                solicitacao.getDataAbertura()
        );
    }
}
