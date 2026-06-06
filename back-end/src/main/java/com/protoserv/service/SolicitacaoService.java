package com.protoserv.service;

import com.protoserv.dto.request.DadosAberturaSolicitacaoDTO;
import com.protoserv.dto.request.DadosNovoAcompanhamentoDTO;
import com.protoserv.dto.response.DadosListagemSolicitacaoDTO;
import com.protoserv.dto.response.DadosSolicitacaoDTO;
import com.protoserv.model.Endereco;
import com.protoserv.model.Perfil;
import com.protoserv.model.Solicitacao;
import com.protoserv.model.StatusSolicitacao;
import com.protoserv.model.Usuario;
import com.protoserv.repository.ServicoRepository;
import com.protoserv.repository.SolicitacaoRepository;
import com.protoserv.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                              ServicoRepository servicoRepository,
                              UsuarioRepository usuarioRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public DadosSolicitacaoDTO abrirSolicitacao(DadosAberturaSolicitacaoDTO dados) {
        
        var servico = servicoRepository.findById(dados.servicoId())
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado no catálogo."));

        var cidadao = buscarUsuarioLogado();

        List<StatusSolicitacao> statusFinais = List.of(StatusSolicitacao.CONCLUIDA, StatusSolicitacao.CANCELADA);
        var solicitacaoAtiva = solicitacaoRepository
                .findFirstByCidadaoAndServicoAndStatusNotInOrderByDataAberturaDesc(cidadao, servico, statusFinais);

        if (solicitacaoAtiva.isPresent()) {
            var ativa = solicitacaoAtiva.get();
            LocalDateTime dataExpiracao = ativa.getDataAbertura().plusDays(servico.getPrazoDias());
            
            if (LocalDateTime.now().isBefore(dataExpiracao)) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                throw new IllegalStateException("Você já possui uma solicitação em andamento para este serviço (Protocolo: " 
                        + ativa.getProtocolo() + "). O prazo para resolução é até " + dataExpiracao.format(formatter) + ".");
            }
        }
        
        var endereco = new Endereco(
                dados.cep(),
                dados.logradouro(),
                dados.numero(),
                dados.bairro(),
                dados.cidade(),
                dados.estado(),
                dados.complemento()
        );

        String protocolo = gerarProtocoloUnico();

        var solicitacao = new Solicitacao(
                protocolo,
                dados.descricao(),
                endereco,
                servico,
                cidadao,
                dados.anexoUrl()
        );

        solicitacaoRepository.save(solicitacao);

        return new DadosSolicitacaoDTO(solicitacao);
    }

    public Page<DadosListagemSolicitacaoDTO> listarSolicitacoes(StatusSolicitacao status, Pageable paginacao) {
        
        Page<Solicitacao> paginaDeSolicitacoes;

        if (status != null) {
            paginaDeSolicitacoes = solicitacaoRepository.findAllByStatus(status, paginacao);
        } else {
            paginaDeSolicitacoes = solicitacaoRepository.findAll(paginacao);
        }

        return paginaDeSolicitacoes.map(DadosListagemSolicitacaoDTO::new);
    }

    @Transactional
    public DadosSolicitacaoDTO assumirSolicitacao(Long id) {
        var solicitacao = buscarSolicitacao(id);

        var atendenteLogado = buscarUsuarioLogado();

        solicitacao.assumir(atendenteLogado);

        return new DadosSolicitacaoDTO(solicitacao);
    }

    @Transactional
    public DadosSolicitacaoDTO adicionarAcompanhamento(Long solicitacaoId, DadosNovoAcompanhamentoDTO dados) {
        var solicitacao = buscarSolicitacao(solicitacaoId);

        var usuarioLogado = buscarUsuarioLogado();

        if (usuarioLogado.getPerfil() == Perfil.CIDADAO) {
            if (!solicitacao.getCidadao().getId().equals(usuarioLogado.getId())) {
                throw new AccessDeniedException("Não tem permissão para adicionar acompanhamentos a uma solicitação de outro cidadão.");
            }
        }

        solicitacao.adicionarAcompanhamento(dados.descricao(), usuarioLogado);

        if (dados.novoStatus() != null && dados.novoStatus() != solicitacao.getStatus()) {
            solicitacao.atualizarStatus(dados.novoStatus(), usuarioLogado);
        }

        return new DadosSolicitacaoDTO(solicitacao);
    }

    private String gerarProtocoloUnico() {
        String dataHoje = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String codigoAleatorio = UUID.randomUUID().toString().substring(0, 6).toUpperCase(); 
        
        return dataHoje + "-" + codigoAleatorio;
    }

    private String capturarEmailUsuarioLogado() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Usuario buscarUsuarioLogado() {
        String emailUsuarioLogado = capturarEmailUsuarioLogado();
        return usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new EntityNotFoundException("Usuário logado não encontrado no banco de dados."));
    }

    private Solicitacao buscarSolicitacao(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada."));
    }
}