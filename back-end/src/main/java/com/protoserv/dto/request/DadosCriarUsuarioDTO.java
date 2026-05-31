package com.protoserv.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DadosCriarUsuarioDTO(
    
    @NotBlank(message = "O nome é obrigatório.")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    String email,

    @NotBlank(message = "A senha inicial é obrigatória.")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres.")
    String senha,

    @NotBlank(message = "O perfil é obrigatório.")
    @Pattern(regexp = "CIDADAO|ATENDENTE|ADMIN", message = "O perfil deve ser CIDADAO, ATENDENTE ou ADMIN")
    String perfil
) {

}
