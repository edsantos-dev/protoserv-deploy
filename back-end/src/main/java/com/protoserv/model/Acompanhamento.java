package com.protoserv.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "acompanhamentos")
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Acompanhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id")
    private Solicitacao solicitacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario autor;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private LocalDateTime dataRegistro;

    public Acompanhamento(Solicitacao solicitacao, Usuario autor, String descricao) {
        this.solicitacao = solicitacao;
        this.autor = autor;
        this.descricao = descricao;
        this.dataRegistro = LocalDateTime.now();
    }
}