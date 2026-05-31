CREATE TABLE servicos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    prazo_dias INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    categoria VARCHAR(100) NOT NULL,
    orientacao_cidadao TEXT
);