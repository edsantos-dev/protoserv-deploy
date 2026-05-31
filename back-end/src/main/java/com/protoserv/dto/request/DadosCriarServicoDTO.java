package com.protoserv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record DadosCriarServicoDTO(

    @NotBlank(message = "O nome do serviço é obrigatório.")
    String nome,

    @NotBlank(message = "A descrição do serviço é obrigatória.")
    String descricao,

    @NotNull(message = "O prazo em dias é obrigatório.")
    @PositiveOrZero(message = "O prazo em dias não pode ser negativo.")
    Integer prazoDias,

    @NotBlank(message = "A categoria é obrigatória.")
    @Pattern(regexp = "INFRAESTRUTURA|SAUDE|MEIO_AMBIENTE|FINANCAS|ASSISTENCIA|OUTROS", 
                message = "A categoria deve ser INFRAESTRUTURA, SAUDE, MEIO_AMBIENTE, FINANCAS, ASSISTENCIA ou OUTROS.")
    String categoria,

    String orientacaoCidadao
) {

}
