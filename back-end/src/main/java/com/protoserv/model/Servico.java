package com.protoserv.model;

import com.protoserv.dto.request.DadosEdicaoServicoDTO;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "servicos")
@EqualsAndHashCode(of = "id")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String descricao;
    private Integer prazoDias;
    private boolean ativo;

    @Enumerated(EnumType.STRING)
    private CategoriaServico categoria;

    private String orientacaoCidadao;

    public Servico(String nome, String descricao, Integer prazoDias, CategoriaServico categoria, String orientacaoCidadao) {
        if (prazoDias != null && prazoDias < 0) {
            throw new IllegalArgumentException("O prazo em dias não pode ser negativo.");
        }
        this.nome = nome;
        this.descricao = descricao;
        this.prazoDias = prazoDias;
        this.categoria = categoria;
        this.orientacaoCidadao = orientacaoCidadao;
        this.ativo = true;
    }

    public void atualizarDados(DadosEdicaoServicoDTO dados, CategoriaServico novaCategoria) {
        if (dados.nome() != null && !dados.nome().isBlank()) {
            this.nome = dados.nome();
        }
        if (dados.descricao() != null && !dados.descricao().isBlank()) {
            this.descricao = dados.descricao();
        }
        if (dados.prazoDias() != null) {
            this.prazoDias = dados.prazoDias();
        }
        if (novaCategoria != null) {
            this.categoria = novaCategoria;
        }
        if (dados.orientacaoCidadao() != null && !dados.orientacaoCidadao().isBlank()) {
            this.orientacaoCidadao = dados.orientacaoCidadao();
        }
    }

    public void desativar() {
        if (!this.ativo) {
            throw new IllegalArgumentException("O serviço já está inativo.");
        }
        
        this.ativo = false;
    }

    public void ativar() {
        if (this.ativo) {
            throw new IllegalArgumentException("O serviço já está ativo.");
        }
        
        this.ativo = true;
    }
}