package com.protoserv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DadosEdicaoUsuarioDTO(
    
    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(min = 3, max = 200, message = "O nome deve ter entre 3 e 200 caracteres.")
    String nome 
) {
    
}
