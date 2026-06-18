package com.protoserv.dto.event;

public record DadosNotificacaoPadraoDTO(

    String emailDestinatario,
    String assunto,
    String mensagem
) {

}
