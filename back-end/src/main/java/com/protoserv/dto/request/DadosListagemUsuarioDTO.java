package com.protoserv.dto.request;

import com.protoserv.model.Perfil;
import com.protoserv.model.StatusUsuario;
import com.protoserv.model.Usuario;

public record DadosListagemUsuarioDTO(
    Long id,
    String nome,
    String email,
    Perfil perfil,
    StatusUsuario status
) {
    public DadosListagemUsuarioDTO(Usuario usuario) {
        this(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getPerfil(),
            usuario.getStatus()
        );
    }
}
