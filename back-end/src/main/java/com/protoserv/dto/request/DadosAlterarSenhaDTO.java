package com.protoserv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DadosAlterarSenhaDTO(
        
        @NotBlank(message = "A senha atual é obrigatória.")
        String senhaAtual,
        
        @NotBlank(message = "A nova senha é obrigatória.")
        @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres.")
        String novaSenha
) {
}