package com.protoserv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosAberturaSolicitacaoDTO(
        
        @NotNull(message = "O ID do serviço pretendido é obrigatório.")
        Long servicoId,

        @NotBlank(message = "A descrição da solicitação é obrigatória.")
        String descricao,

        @NotBlank(message = "O CEP é obrigatório.")
        String cep,

        @NotBlank(message = "O logradouro (rua, avenida) é obrigatório.")
        String logradouro,

        @NotBlank(message = "O número é obrigatório.")
        String numero,

        @NotBlank(message = "O bairro é obrigatório.")
        String bairro,

        @NotBlank(message = "A cidade é obrigatória.")
        String cidade,

        @NotBlank(message = "O estado é obrigatório.")
        String estado,

        String complemento,
        
        String anexoUrl
) {
}
