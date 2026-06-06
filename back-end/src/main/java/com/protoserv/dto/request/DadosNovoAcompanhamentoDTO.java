package com.protoserv.dto.request;

import com.protoserv.model.StatusSolicitacao;
import jakarta.validation.constraints.NotBlank;

public record DadosNovoAcompanhamentoDTO(
        
    @NotBlank(message = "A descrição do acompanhamento não pode estar vazia.")
    String descricao,
        
    StatusSolicitacao novoStatus
) {
}
