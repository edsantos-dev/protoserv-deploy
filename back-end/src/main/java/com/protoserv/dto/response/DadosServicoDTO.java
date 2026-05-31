package com.protoserv.dto.response;

import com.protoserv.model.CategoriaServico;
import com.protoserv.model.Servico;

public record DadosServicoDTO(
        Long id,
        String nome,
        String descricao,
        Integer prazoDias,
        boolean ativo,
        CategoriaServico categoria,
        String orientacaoCidadao
) {
    public DadosServicoDTO(Servico servico) {
        this(
                servico.getId(),
                servico.getNome(),
                servico.getDescricao(),
                servico.getPrazoDias(),
                servico.isAtivo(),
                servico.getCategoria(),
                servico.getOrientacaoCidadao()
        );
    }
}