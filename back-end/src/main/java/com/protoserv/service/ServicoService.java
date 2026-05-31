package com.protoserv.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.protoserv.dto.request.DadosCriarServicoDTO;
import com.protoserv.dto.response.DadosListagemServicoDTO;
import com.protoserv.dto.response.DadosServicoDTO;
import com.protoserv.model.CategoriaServico;
import com.protoserv.model.Servico;
import com.protoserv.repository.ServicoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @Transactional
    public DadosServicoDTO criarServico(DadosCriarServicoDTO dados) {
        if (servicoRepository.findByNome(dados.nome()).isPresent()) {
            throw new IllegalArgumentException("Já existe um serviço com esse nome.");
        }

        CategoriaServico categoriaEnum = CategoriaServico.valueOf(dados.categoria().toUpperCase());

        Servico servico = new Servico(
                dados.nome(),
                dados.descricao(),
                dados.prazoDias(),
                categoriaEnum,
                dados.orientacaoCidadao()
        );

        servicoRepository.save(servico);

        return new DadosServicoDTO(servico);
    }

    public Page<DadosListagemServicoDTO> listarServicos(String busca, Pageable paginacao) {
        String termoBusca = "";
        
        if (busca != null) {
            termoBusca = busca.trim();
        }

        return servicoRepository.findByAtivoTrueAndNomeContainingIgnoreCase(termoBusca, paginacao).map(DadosListagemServicoDTO::new);
    }

    public DadosServicoDTO detalharServico(Long id) {
        var servico = servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado na base de dados."));

        return new DadosServicoDTO(servico);
    }
}
