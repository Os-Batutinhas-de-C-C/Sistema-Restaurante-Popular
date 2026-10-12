CREATE TABLE Usuário
(
  id_usuario INT NOT NULL,
  nome VARCHAR NOT NULL,
  senha VARCHAR NOT NULL,
  email_recuperacao VARCHAR NOT NULL,
  tipo CHAR NOT NULL,
  PRIMARY KEY (id_usuario)
);

CREATE TABLE Refeição
(
  guarnição VARCHAR NOT NULL,
  proteína VARCHAR NOT NULL,
  acompanhamento_1 VARCHAR NOT NULL,
  acompanhamento_2 VARCHAR NOT NULL,
  suco VARCHAR NOT NULL,
  salada VARCHAR NOT NULL,
  sobremesa VARCHAR NOT NULL,
  id_refeição INT NOT NULL,
  PRIMARY KEY (id_refeição)
);

CREATE TABLE Estoque
(
  id_material INT NOT NULL,
  nome CHAR NOT NULL,
  quantidade INT NOT NULL,
  data_de_entrega DATE NOT NULL,
  data_de_validade DATE NOT NULL,
  lote INT NOT NULL,
  unidade VARCHAR NOT NULL,
  observações VARCHAR NOT NULL,
  PRIMARY KEY (id_material)
);

CREATE TABLE Mensagens
(
  id_mensagem INT NOT NULL,
  texto VARCHAR NOT NULL,
  horario INT NOT NULL,
  data DATE NOT NULL,
  PRIMARY KEY (id_mensagem)
);

CREATE TABLE Notícias
(
  duração INT NOT NULL,
  id_mensagem INT NOT NULL,
  PRIMARY KEY (id_mensagem),
  FOREIGN KEY (id_mensagem) REFERENCES Mensagens(id_mensagem)
);

CREATE TABLE Semana
(
  id_semana INT NOT NULL,
  data DATE NOT NULL,
  desperdício INT NOT NULL,
  ficha_vendidas INT NOT NULL,
  id_refeição INT NOT NULL,
  PRIMARY KEY (id_semana),
  FOREIGN KEY (id_refeição) REFERENCES Refeição(id_refeição),
  UNIQUE (data, desperdício, id_refeição, ficha_vendidas)
);

CREATE TABLE Mensagem/Usuário
(
  id_usuario INT NOT NULL,
  id_mensagem INT NOT NULL,
  PRIMARY KEY (id_usuario, id_mensagem),
  FOREIGN KEY (id_usuario) REFERENCES Usuário(id_usuario),
  FOREIGN KEY (id_mensagem) REFERENCES Mensagens(id_mensagem)
);