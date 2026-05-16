package com.protoserv.service;

import com.protoserv.dto.request.DadosListagemUsuarioDTO;
import com.protoserv.model.StatusUsuario;
import com.protoserv.model.Usuario;
import com.protoserv.repository.UsuarioRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Page<DadosListagemUsuarioDTO> listarUsuario(StatusUsuario status, Pageable paginacao) {
        Page<Usuario> usuarioPage;

        if (status == null) {
            usuarioPage = usuarioRepository.findAll(paginacao);
        } else {
            usuarioPage = usuarioRepository.findByStatus(status, paginacao);
        }

        return usuarioPage.map(DadosListagemUsuarioDTO::new);
    }

    @Transactional
    public void inativarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (usuario.getStatus() == StatusUsuario.INATIVO) {
            throw new IllegalArgumentException("O usuário já está inativo.");
        }
        
        usuario.setStatus(StatusUsuario.INATIVO);
    }

    @Transactional
    public void ativarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (usuario.getStatus() == StatusUsuario.ATIVO) {
            throw new IllegalArgumentException("O usuário já está ativo.");
        }

        usuario.setStatus(StatusUsuario.ATIVO);
    }
}