package com.protoserv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DadosEdicaoUsuarioAdminDTO(
    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(min = 3, max = 200, message = "O nome deve ter entre 3 e 200 caracteres.")
    String nome,

    @NotBlank(message = "O perfil é obrigatório")
    @Pattern(regexp = "CIDADAO|ATENDENTE|ADMIN", message = "O perfil deve ser CIDADAO, ATENDENTE ou ADMIN")
    String perfil
) {

}
