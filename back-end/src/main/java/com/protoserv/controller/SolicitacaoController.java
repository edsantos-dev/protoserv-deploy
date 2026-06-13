package com.protoserv.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.protoserv.dto.request.DadosAberturaSolicitacaoDTO;
import com.protoserv.dto.request.DadosNovoAcompanhamentoDTO;
import com.protoserv.dto.request.DadosReclassificacaoSolicitacaoDTO;
import com.protoserv.dto.response.DadosListagemSolicitacaoDTO;
import com.protoserv.dto.response.DadosSolicitacaoDTO;
import com.protoserv.model.StatusSolicitacao;
import com.protoserv.service.SolicitacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    public SolicitacaoController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CIDADAO')")
    public ResponseEntity<DadosSolicitacaoDTO> abrir(@RequestBody @Valid DadosAberturaSolicitacaoDTO dados, UriComponentsBuilder uriBuilder) {
        
        var solicitacao = solicitacaoService.abrirSolicitacao(dados);

        var uri = uriBuilder.path("/solicitacoes/{id}").buildAndExpand(solicitacao.id()).toUri();

        return ResponseEntity.created(uri).body(solicitacao);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ATENDENTE', 'ADMIN')")
    public ResponseEntity<Page<DadosListagemSolicitacaoDTO>> listar(
            @RequestParam(required = false) StatusSolicitacao status,
            @RequestParam(required = false) Long servicoId,
            @RequestParam(required = false) String logradouro,
            @RequestParam(required = false) String bairro,
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal,
            @PageableDefault(size = 10, sort = "dataAbertura,desc") Pageable paginacao) {

        var pagina = solicitacaoService.listarSolicitacoes(status, servicoId, logradouro, bairro, cidade, estado, dataInicial, dataFinal, paginacao);
        
        return ResponseEntity.ok(pagina);
    }

    @PatchMapping("/{id}/assumir")
    @PreAuthorize("hasAnyAuthority('ATENDENTE')")
    public ResponseEntity<DadosSolicitacaoDTO> assumir(@PathVariable Long id) {
        var solicitacaoAtualizada = solicitacaoService.assumirSolicitacao(id);

        return ResponseEntity.ok(solicitacaoAtualizada);
    }

    @PostMapping("/{id}/acompanhamentos")
    @PreAuthorize("hasAnyAuthority('ATENDENTE', 'CIDADAO')") 
    public ResponseEntity<DadosSolicitacaoDTO> adicionarAcompanhamento(
            @PathVariable Long id,
            @RequestBody @Valid DadosNovoAcompanhamentoDTO dados) {
        
        var solicitacaoAtualizada = solicitacaoService.adicionarAcompanhamento(id, dados);

        return ResponseEntity.ok(solicitacaoAtualizada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DadosSolicitacaoDTO> detalhar(@PathVariable Long id) {
        var detalhamento = solicitacaoService.detalharSolicitacao(id);

        return ResponseEntity.ok(detalhamento);
    }

    @GetMapping("/minhas")
    @PreAuthorize("hasAuthority('CIDADAO')")
    public ResponseEntity<Page<DadosListagemSolicitacaoDTO>> listarMinhas(@PageableDefault(size = 10, sort = {"dataAbertura, desc"}) Pageable paginacao) {
        
        var pagina = solicitacaoService.listarMinhasSolicitacoes(paginacao);

        return ResponseEntity.ok(pagina);
    }

    @PatchMapping("/{id}/classificacao")
    @PreAuthorize("hasAnyAuthority('ATENDENTE')")
    public ResponseEntity<DadosSolicitacaoDTO> reclassificar(
            @PathVariable Long id,
            @RequestBody DadosReclassificacaoSolicitacaoDTO dados) {
        
        var solicitacaoAtualizada = solicitacaoService.reclassificar(id, dados);

        return ResponseEntity.ok(solicitacaoAtualizada);
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasAuthority('CIDADAO')")
    public ResponseEntity<DadosSolicitacaoDTO> cancelar(@PathVariable Long id) {
        
        var solicitacaoCancelada = solicitacaoService.cancelarSolicitacao(id);
        
        return ResponseEntity.ok(solicitacaoCancelada);
    }

    @PatchMapping("/{id}/reabrir")
    @PreAuthorize("hasAuthority('CIDADAO')")
    public ResponseEntity<DadosSolicitacaoDTO> reabrir(@PathVariable Long id) {
        
        var solicitacaoReaberta = solicitacaoService.reabrirSolicitacao(id);
        
        return ResponseEntity.ok(solicitacaoReaberta);
    }
}
