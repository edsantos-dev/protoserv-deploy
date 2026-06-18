package com.protoserv.config.notificacao;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.protoserv.dto.event.DadosNotificacaoPadraoDTO;

@Component
public class NotificacaoListener {

    private final EmailService emailService;

    public NotificacaoListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async
    @EventListener
    public void escutarNotificacao(DadosNotificacaoPadraoDTO evento) {
        emailService.enviarEmailTexto(
                evento.emailDestinatario(),
                evento.assunto(),
                evento.mensagem()
        );
    }
}
