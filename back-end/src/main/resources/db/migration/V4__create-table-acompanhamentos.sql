CREATE TABLE acompanhamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    solicitacao_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    descricao TEXT NOT NULL,
    data_registro DATETIME NOT NULL,
    
    CONSTRAINT fk_acompanhamentos_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
    CONSTRAINT fk_acompanhamentos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);