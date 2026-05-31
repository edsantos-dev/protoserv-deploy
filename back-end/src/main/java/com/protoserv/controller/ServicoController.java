package com.protoserv.controller;

import com.protoserv.dto.request.DadosCriarServicoDTO;
import com.protoserv.dto.response.DadosServicoDTO;
import com.protoserv.service.ServicoService;
import jakarta.validation.Valid;
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
}