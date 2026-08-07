DROP DATABASE IF EXISTS manutcontrol_testes;
CREATE DATABASE manutcontrol_testes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE manutcontrol_testes;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  perfil ENUM('Operador', 'Técnico', 'Administrador') NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE equipamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL,
  nome VARCHAR(120) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipamento_id INT NOT NULL,
  operador_id INT NOT NULL,
  tecnico_id INT NULL,
  descricao VARCHAR(300) NOT NULL,
  prioridade ENUM('Baixa', 'Média', 'Alta', 'Crítica') NOT NULL,
  status ENUM('Aguardando atendimento', 'Em atendimento', 'Concluído') NOT NULL,
  solucao VARCHAR(500) NULL,
  data_abertura DATETIME NOT NULL,
  data_conclusao DATETIME NULL,

  CONSTRAINT fk_chamado_equipamento
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),

  CONSTRAINT fk_chamado_operador
    FOREIGN KEY (operador_id) REFERENCES usuarios(id),

  CONSTRAINT fk_chamado_tecnico
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES
('Operador Principal', 'operador@industria.com', 'Operador@123', 'Operador', TRUE),
('Técnico Principal', 'tecnico@industria.com', 'Tecnico@123', 'Técnico', TRUE),
('Operador Bloqueado', 'bloqueado@industria.com', 'Usuario@123', 'Operador', FALSE),
('Administrador', 'admin@industria.com', 'Admin@123', 'Administrador', TRUE),
('Técnico Dois', 'tecnico2@industria.com', 'Tecnico2@123', 'Técnico', TRUE),
('Operador Dois', 'operador2@industria.com', 'Operador2@123', 'Operador', TRUE);

INSERT INTO equipamentos (codigo, nome, ativo) VALUES
('EQP-001', 'Prensa hidráulica', TRUE),
('EQP-002', 'Esteira transportadora', FALSE);

INSERT INTO chamados
(equipamento_id, operador_id, tecnico_id, descricao, prioridade, status, solucao, data_abertura, data_conclusao)
VALUES
(
  1,
  1,
  NULL,
  'A prensa apresenta vazamento de óleo durante o ciclo normal de operação.',
  'Alta',
  'Aguardando atendimento',
  NULL,
  NOW(),
  NULL
),
(
  1,
  6,
  2,
  'O equipamento apresenta ruído excessivo e vibração durante o funcionamento.',
  'Média',
  'Em atendimento',
  NULL,
  NOW(),
  NULL
);
