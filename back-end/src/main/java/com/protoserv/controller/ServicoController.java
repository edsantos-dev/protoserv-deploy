package com.protoserv.controller;

import com.protoserv.dto.request.DadosCriarServicoDTO;
import com.protoserv.dto.request.DadosEdicaoServicoDTO;
import com.protoserv.dto.response.DadosListagemServicoDTO;
import com.protoserv.dto.response.DadosServicoDTO;
import com.protoserv.service.ServicoService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DadosServicoDTO> criarServico(@RequestBody @Valid DadosCriarServicoDTO dados, UriComponentsBuilder uriBuilder) {
        
        DadosServicoDTO servicoCriado = servicoService.criarServico(dados);

        var uri = uriBuilder.path("/servicos/{id}").buildAndExpand(servicoCriado.id()).toUri();

        return ResponseEntity.created(uri).body(servicoCriado);
    }

    @GetMapping
    public ResponseEntity<Page<DadosListagemServicoDTO>> listarServicos(
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 6, sort = {"nome"}) Pageable paginacao) {
        
        var page = servicoService.listarServicos(busca, paginacao);
        
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DadosServicoDTO> detalharServico(@PathVariable Long id) {
        var servico = servicoService.detalharServico(id);
        
        return ResponseEntity.ok(servico);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DadosServicoDTO> atualizarServico(
            @PathVariable Long id, 
            @RequestBody @Valid DadosEdicaoServicoDTO dados) {
        var servicoAtualizado = servicoService.atualizarServico(id, dados);

        return ResponseEntity.ok(servicoAtualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> desativarServico(@PathVariable Long id) {
        servicoService.desativarServico(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> ativarServico(@PathVariable Long id) {
        servicoService.ativarServico(id);

        return ResponseEntity.noContent().build();
    }
}