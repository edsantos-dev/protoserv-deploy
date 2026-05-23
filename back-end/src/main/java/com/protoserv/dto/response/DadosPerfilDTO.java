package com.protoserv.dto.response;

import com.protoserv.model.Perfil;
import com.protoserv.model.Usuario;

public record DadosPerfilDTO(
        Long id,
        String nome,
        String email,
        Perfil perfil
) {
    public DadosPerfilDTO(Usuario usuario) {
        this(
            usuario.getId(), 
            usuario.getNome(), 
            usuario.getEmail(), 
            usuario.getPerfil()
        );
    }
}