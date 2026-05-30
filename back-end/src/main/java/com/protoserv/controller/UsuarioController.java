package com.protoserv.controller;

import com.protoserv.dto.request.DadosAlterarSenhaDTO;
import com.protoserv.dto.request.DadosCriarUsuarioDTO;
import com.protoserv.dto.request.DadosEdicaoUsuarioAdminDTO;
import com.protoserv.dto.request.DadosEdicaoUsuarioDTO;
import com.protoserv.dto.response.DadosListagemUsuarioDTO;
import com.protoserv.dto.response.DadosPerfilDTO;
import com.protoserv.model.StatusUsuario;
import com.protoserv.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DadosPerfilDTO> criarUsuario(
            @RequestBody @Valid DadosCriarUsuarioDTO dto,
            UriComponentsBuilder uriBuilder) {
        
        DadosPerfilDTO novoUsuario = usuarioService.criarUsuario(dto);
        
        var uri = uriBuilder.path("/api/usuarios/{id}").buildAndExpand(novoUsuario.id()).toUri();
        
        return ResponseEntity.created(uri).body(novoUsuario);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<DadosListagemUsuarioDTO>> listar(
            @RequestParam(required = false) StatusUsuario status,
            @PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao) {
        
        Page<DadosListagemUsuarioDTO> page = usuarioService.listarUsuario(status, paginacao);
        return ResponseEntity.ok(page);
    }

    @DeleteMapping("/inativar/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        usuarioService.inativarUsuario(id);
        
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/ativar/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        usuarioService.ativarUsuario(id);
        
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<DadosPerfilDTO> meuPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        DadosPerfilDTO perfil = usuarioService.obterPerfilLogado(userDetails.getUsername());
        return ResponseEntity.ok(perfil);
    }

    @PatchMapping("/me/senha")
    public ResponseEntity<Void> alterarMinhaSenha(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid DadosAlterarSenhaDTO dto) {
        
        usuarioService.alterarSenha(userDetails.getUsername(), dto);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me")
    public ResponseEntity<DadosPerfilDTO> atualizarMeuPerfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid DadosEdicaoUsuarioDTO dto) {
        
        DadosPerfilDTO perfilAtualizado = usuarioService.atualizarDadosUsuario(userDetails.getUsername(), dto);
        
        return ResponseEntity.ok(perfilAtualizado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DadosPerfilDTO> atualizarUsuario(
            @PathVariable Long id,
            @RequestBody @Valid DadosEdicaoUsuarioAdminDTO dto) {
        
        DadosPerfilDTO usuarioAtualizado = usuarioService.atualizarUsuarioPeloAdmin(id, dto);
        
        return ResponseEntity.ok(usuarioAtualizado);
    }
}