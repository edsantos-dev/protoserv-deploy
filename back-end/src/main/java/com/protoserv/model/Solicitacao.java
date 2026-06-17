package com.protoserv.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "solicitacoes")
@EqualsAndHashCode(of = "id")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String protocolo;
    private String descricao;

    @Embedded
    private Endereco endereco;

    @Enumerated(EnumType.STRING)
    private StatusSolicitacao status;

    @Enumerated(EnumType.STRING)
    private PrioridadeSolicitacao prioridade;

    private String anexoUrl;

    private LocalDateTime dataAbertura;

    private LocalDateTime dataConclusao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cidadao_id")
    private Usuario cidadao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendente_id")
    private Usuario atendente;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Acompanhamento> acompanhamentos = new ArrayList<>();

    public Solicitacao(String protocolo, String descricao, Endereco endereco, Servico servico, Usuario cidadao, String anexoUrl) {
        this.protocolo = protocolo;
        this.descricao = descricao;
        this.endereco = endereco;
        this.servico = servico;
        this.cidadao = cidadao;
        this.anexoUrl = anexoUrl;
        this.status = StatusSolicitacao.NOVO;
        this.prioridade = PrioridadeSolicitacao.MEDIA;
        this.dataAbertura = LocalDateTime.now();
    }

    public void assumir(Usuario atendente) {
        if (this.status != StatusSolicitacao.NOVO) {
            throw new IllegalStateException("Apenas solicitações com status NOVO podem ser assumidas.");
        }
        if (atendente == null) {
            throw new IllegalArgumentException("O atendente não pode ser nulo ao assumir a solicitação.");
        }
        
        this.atendente = atendente;
        this.status = StatusSolicitacao.EM_ANDAMENTO;
    }

    public void adicionarAcompanhamento(String descricao, Usuario autor, String anexoUrl) {
        if (this.status == StatusSolicitacao.CONCLUIDA || this.status == StatusSolicitacao.CANCELADA) {
            throw new IllegalStateException("Não é possível adicionar acompanhamentos a uma solicitação finalizada.");
        }
        
        Acompanhamento novoAcompanhamento = new Acompanhamento(this, autor, descricao, anexoUrl);
        this.acompanhamentos.add(novoAcompanhamento);
    }

    public void adicionarAcompanhamentoSistema(String descricao) {
        Acompanhamento novoAcompanhamento = new Acompanhamento(this, null, descricao, null);
        this.acompanhamentos.add(novoAcompanhamento);
    }

    public void atualizarStatus(StatusSolicitacao novoStatus, Usuario executor) {
        if (executor.getPerfil() == Perfil.CIDADAO) {
            throw new SecurityException("Cidadãos não têm permissão para alterar o status da solicitação.");
        }
        
        if (novoStatus == null) {
            throw new IllegalArgumentException("O novo status não pode ser nulo.");
        }

        if (novoStatus == this.status) {
            throw new IllegalStateException("O status da solicitação já é " + novoStatus + ".");
            
        }

        if (this.status == StatusSolicitacao.CANCELADA || this.status == StatusSolicitacao.CONCLUIDA) {
            throw new IllegalStateException("Não é possível alterar o status de uma solicitação que já foi concluída ou cancelada.");
        }

        StatusSolicitacao statusAnterior = this.status;

        if (novoStatus != StatusSolicitacao.NOVO) {
            this.status = novoStatus;
        }else {
            throw new IllegalStateException("O status só pode ser alterado para EM_ANDAMENTO, CONCLUIDA ou CANCELADA.");
        }
        
        if (novoStatus == StatusSolicitacao.CONCLUIDA || novoStatus == StatusSolicitacao.CANCELADA) {
            this.dataConclusao = LocalDateTime.now();
        }

        this.adicionarAcompanhamentoSistema(
            String.format("SISTEMA: O status da solicitação foi alterado de %s para %s.", statusAnterior, novoStatus)
        );
    }

    public void reclassificar(Servico novoServico, PrioridadeSolicitacao novaPrioridade) {
        if (novoServico != null) {
            this.servico = novoServico;
        }
        if (novaPrioridade != null) {
            this.prioridade = novaPrioridade;
        }
    }

    public void cancelar() {
        if (this.status == StatusSolicitacao.CANCELADA || this.status == StatusSolicitacao.CONCLUIDA) {
        throw new IllegalStateException("Não é possível cancelar uma solicitação que já foi concluída ou cancelada.");
    }
        
        this.status = StatusSolicitacao.CANCELADA;
        this.dataConclusao = LocalDateTime.now();
        
        this.adicionarAcompanhamentoSistema("SISTEMA: Solicitação cancelada pelo cidadão.");
    }

public void reabrir() {
    if (this.status != StatusSolicitacao.CONCLUIDA && this.status != StatusSolicitacao.CANCELADA) {
        throw new IllegalStateException("Apenas solicitações com status CONCLUIDA ou CANCELADA podem ser reabertas.");
    }

    if (this.status == StatusSolicitacao.CONCLUIDA 
            && this.dataConclusao != null 
            && this.dataConclusao.plusDays(3).isBefore(LocalDateTime.now())) {
        throw new IllegalStateException("O prazo de 3 dias para reabertura desta solicitação já expirou.");
    }
    
    this.status = StatusSolicitacao.EM_ANDAMENTO;
    this.dataConclusao = null; 
    
    this.adicionarAcompanhamentoSistema("SISTEMA: Solicitação reaberta pelo cidadão.");
}
}