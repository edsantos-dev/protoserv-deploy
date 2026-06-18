package com.protoserv.service;

import com.protoserv.dto.event.DadosNotificacaoPadraoDTO;
import com.protoserv.dto.request.DadosAberturaSolicitacaoDTO;
import com.protoserv.dto.request.DadosNovoAcompanhamentoDTO;
import com.protoserv.dto.request.DadosReclassificacaoSolicitacaoDTO;
import com.protoserv.dto.response.DadosListagemSolicitacaoDTO;
import com.protoserv.dto.response.DadosSolicitacaoDTO;
import com.protoserv.model.Endereco;
import com.protoserv.model.Perfil;
import com.protoserv.model.Servico;
import com.protoserv.model.Solicitacao;
import com.protoserv.model.StatusSolicitacao;
import com.protoserv.model.Usuario;
import com.protoserv.repository.ServicoRepository;
import com.protoserv.repository.SolicitacaoRepository;
import com.protoserv.repository.UsuarioRepository;
import com.protoserv.specification.SolicitacaoSpecification;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ApplicationEventPublisher publisher;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                              ServicoRepository servicoRepository,
                              UsuarioRepository usuarioRepository,
                              ApplicationEventPublisher publisher) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.publisher = publisher;
    }

    @Transactional
    public DadosSolicitacaoDTO abrirSolicitacao(DadosAberturaSolicitacaoDTO dados) {
        
        var servico = buscarServico(dados.servicoId());

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

    public Page<DadosListagemSolicitacaoDTO> listarSolicitacoes(
            StatusSolicitacao status, 
            Long servicoId,
            String logradouro,
            String bairro,
            String cidade,
            String estado,
            String nomeAtendente,
            LocalDate dataInicial,
            LocalDate dataFinal,
            Pageable paginacao) {

        var specification = SolicitacaoSpecification.comFiltros(status, servicoId, logradouro, bairro, cidade, estado, nomeAtendente, dataInicial, dataFinal);

        var paginaDeSolicitacoes = solicitacaoRepository.findAll(specification, paginacao);

        return paginaDeSolicitacoes.map(DadosListagemSolicitacaoDTO::new);
    }

    public Page<DadosListagemSolicitacaoDTO> listarMinhasSolicitacoes(Pageable paginacao) {
        var cidadaoLogado = buscarUsuarioLogado();
        
        Page<Solicitacao> paginaDeSolicitacoes = solicitacaoRepository.findAllByCidadaoId(cidadaoLogado.getId(), paginacao);
        
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

        validarPropriedadeDoCidadao(solicitacao, usuarioLogado, "adicionar acompanhamento a");

        solicitacao.adicionarAcompanhamento(dados.descricao(), usuarioLogado, dados.anexoUrl());

        if (dados.novoStatus() != null && dados.novoStatus() != solicitacao.getStatus()) {
            solicitacao.atualizarStatus(dados.novoStatus(), usuarioLogado); 
        }

        return new DadosSolicitacaoDTO(solicitacao);
    }

    public DadosSolicitacaoDTO detalharSolicitacao(Long id) {
        var solicitacao = buscarSolicitacao(id);

        var usuarioLogado = buscarUsuarioLogado();

        validarPropriedadeDoCidadao(solicitacao, usuarioLogado, "visualizar os detalhes de");

        return new DadosSolicitacaoDTO(solicitacao);
    }

    @Transactional
    public DadosSolicitacaoDTO reclassificar(Long id, DadosReclassificacaoSolicitacaoDTO dados) {
        var solicitacao = buscarSolicitacao(id);

        StringBuilder mudancas = new StringBuilder("SISTEMA: Reclassificação da solicitação. ");
        boolean houveMudanca = false;

        if (dados.servicoId() != null && !dados.servicoId().equals(solicitacao.getServico().getId())) {
            var novoServico = buscarServico(dados.servicoId());
            
            mudancas.append(String.format("Serviço alterado de '%s' para '%s'. ", solicitacao.getServico().getNome(), novoServico.getNome()));
            solicitacao.reclassificar(novoServico, null);
            houveMudanca = true;
        }

        if (dados.prioridade() != null && !dados.prioridade().equals(solicitacao.getPrioridade())) {
            mudancas.append(String.format("Prioridade alterada para %s. ", dados.prioridade()));
            solicitacao.reclassificar(null, dados.prioridade());
            houveMudanca = true;
        }

        if (houveMudanca) {
            solicitacao.adicionarAcompanhamentoSistema(mudancas.toString());
        }

        return new DadosSolicitacaoDTO(solicitacao);
    }

    @Transactional
    public DadosSolicitacaoDTO cancelarSolicitacao(Long id) {
        var solicitacao = buscarSolicitacao(id);

        var usuarioLogado = buscarUsuarioLogado();

        validarPropriedadeDoCidadao(solicitacao, usuarioLogado, "cancelar");

        solicitacao.cancelar();

        var evento = new DadosNotificacaoPadraoDTO(
            solicitacao.getCidadao().getEmail(),
            "Solicitação Cancelada - Protocolo " + solicitacao.getProtocolo(),
            "Olá " + solicitacao.getCidadao().getNome() + ", informamos que a solicitação de protocolo " 
            + solicitacao.getProtocolo() + " foi cancelada com sucesso no nosso sistema."
        );
        
        publisher.publishEvent(evento);

        return new DadosSolicitacaoDTO(solicitacao);
    }

    @Transactional
    public DadosSolicitacaoDTO reabrirSolicitacao(Long id) {
        var solicitacao = buscarSolicitacao(id);

        var usuarioLogado = buscarUsuarioLogado();

        validarPropriedadeDoCidadao(solicitacao, usuarioLogado, "reabrir");

        solicitacao.reabrir();

        return new DadosSolicitacaoDTO(solicitacao);
    }

    private void validarPropriedadeDoCidadao(Solicitacao solicitacao, Usuario usuarioLogado, String acao) {
        if (usuarioLogado.getPerfil() == Perfil.CIDADAO) {
            if (!solicitacao.getCidadao().getId().equals(usuarioLogado.getId())) {
                throw new AccessDeniedException("Você não tem permissão para " + acao + " uma solicitação de outro cidadão.");
            }
        }
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

    private Servico buscarServico(Long id) {
        return servicoRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado no catálogo."));
    }

    private Solicitacao buscarSolicitacao(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada."));
    }
}