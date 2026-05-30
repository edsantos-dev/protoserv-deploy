package com.protoserv.service;

import com.protoserv.dto.request.DadosAlterarSenhaDTO;
import com.protoserv.dto.request.DadosCriarUsuarioDTO;
import com.protoserv.dto.request.DadosEdicaoUsuarioAdminDTO;
import com.protoserv.dto.request.DadosEdicaoUsuarioDTO;
import com.protoserv.dto.response.DadosListagemUsuarioDTO;
import com.protoserv.dto.response.DadosPerfilDTO;
import com.protoserv.model.Perfil;
import com.protoserv.model.StatusUsuario;
import com.protoserv.model.Usuario;
import com.protoserv.repository.UsuarioRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public DadosPerfilDTO criarUsuario(DadosCriarUsuarioDTO dados) {
        if (usuarioRepository.findByEmail(dados.email()).isPresent()) {
            throw new IllegalArgumentException("O e-mail já está em uso.");
        }

        Perfil perfilUsuario = Perfil.valueOf(dados.perfil().toUpperCase());
        
        String senhaCriptografada = passwordEncoder.encode(dados.senha());

        Usuario usuario = new Usuario(dados.nome(), dados.email(), senhaCriptografada, perfilUsuario);
        
        usuarioRepository.save(usuario);

        return new DadosPerfilDTO(usuario);
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
        Usuario usuario = buscarUsuario(id);

        usuario.inativar();
    }

    @Transactional
    public void ativarUsuario(Long id) {
        Usuario usuario = buscarUsuario(id);

        usuario.ativar();
    }

    public DadosPerfilDTO obterPerfilLogado(String email) {
        Usuario usuario = buscarPorEmail(email);
        return new DadosPerfilDTO(usuario);
    }

    @Transactional
    public void alterarSenha(String email, DadosAlterarSenhaDTO dto) {
        Usuario usuario = buscarPorEmail(email);

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new IllegalArgumentException("A senha atual informada está incorreta.");
        }

        if (passwordEncoder.matches(dto.novaSenha(), usuario.getSenha())) {
            throw new IllegalArgumentException("A nova senha não pode ser igual à senha atual.");
        }

        String novaSenhaCriptografada = passwordEncoder.encode(dto.novaSenha());
        usuario.atualizarSenha(novaSenhaCriptografada);
    }

    @Transactional
    public DadosPerfilDTO atualizarDadosUsuario(String email, DadosEdicaoUsuarioDTO dadosEdicao) {
        Usuario usuario = buscarPorEmail(email);

        usuario.atualizarDadosUsuario(dadosEdicao.nome());

        return new DadosPerfilDTO(usuario);
    }

    @Transactional
    public DadosPerfilDTO atualizarUsuarioPeloAdmin(Long id, DadosEdicaoUsuarioAdminDTO dadosEdicao) {
        Usuario usuario = buscarUsuario(id);

        Perfil perfilEnum = Perfil.valueOf(dadosEdicao.perfil().toUpperCase());

        usuario.atualizarDadosUsuario(dadosEdicao.nome());
        usuario.alterarDadosUsuarioPerfilAdmin(perfilEnum);

        return new DadosPerfilDTO(usuario);
    }

    private Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    }
}