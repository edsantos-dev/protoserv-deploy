package com.protoserv.dto.response;

import com.protoserv.model.CategoriaServico;
import com.protoserv.model.Servico;

public record DadosListagemServicoDTO(
        Long id,
        String nome,
        CategoriaServico categoria,
        Integer prazoDias,
        boolean ativo
) {
    public DadosListagemServicoDTO(Servico servico) {
        this(
                servico.getId(),
                servico.getNome(),
                servico.getCategoria(),
                servico.getPrazoDias(),
                servico.isAtivo()
        );
    }
}