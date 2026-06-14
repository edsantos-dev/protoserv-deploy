package com.protoserv.dto.response;

import com.protoserv.model.Solicitacao;
import java.time.LocalDateTime;
import java.util.List;

public record DadosSolicitacaoDTO(
        Long id,
        String protocolo,
        String descricao,
        String status,
        String prioridade,
        String servicoNome,
        String cidadaoNome,
        String cep,
        String logradouro,
        String numero,
        String bairro,
        String cidade,
        String estado,
        String complemento,
        String anexoUrl,
        LocalDateTime dataAbertura,
        LocalDateTime dataConclusao,
        List<DadosAcompanhamentoDTO> historico
) {
    public DadosSolicitacaoDTO(Solicitacao solicitacao) {
        this(
            solicitacao.getId(),
            solicitacao.getProtocolo(),
            solicitacao.getDescricao(),
            solicitacao.getStatus().name(),
            solicitacao.getPrioridade().name(),
            solicitacao.getServico().getNome(),
            solicitacao.getCidadao().getNome(),
            solicitacao.getEndereco().getCep(),
            solicitacao.getEndereco().getLogradouro(),
            solicitacao.getEndereco().getNumero(),
            solicitacao.getEndereco().getBairro(),
            solicitacao.getEndereco().getCidade(),
            solicitacao.getEndereco().getEstado(),
            solicitacao.getEndereco().getComplemento(),
            solicitacao.getAnexoUrl(),
            solicitacao.getDataAbertura(),
            solicitacao.getDataConclusao(),
            solicitacao.getAcompanhamentos() != null ? solicitacao.getAcompanhamentos().stream().map(DadosAcompanhamentoDTO::new).toList() : List.of()
        );
    }
}
