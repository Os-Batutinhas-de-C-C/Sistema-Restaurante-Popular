# Requisitos — Integração entre Frontend e Backend

## Objetivo

Conectar os serviços do frontend Next.js à API Spring Boot para consultar e persistir os dados do Restaurante Popular, mantendo a interface existente. Este documento define os limites da integração, os contratos HTTP de referência, a conversão entre os dados exibidos pela interface e os DTOs da API, além das decisões que precisam ser confirmadas antes de implementar comportamentos ainda indefinidos.

## Referências e fonte do contrato

- `fetch.md`: não alterar o visual do frontend nem as regras de segurança ou de negócio do backend; manter dependências adicionais no mínimo; esclarecer ambiguidades antes de decisões críticas.
- `backend/specs/DTOs/requirements.md`: referência principal dos endpoints, DTOs, campos JSON, status HTTP e permissões atualmente especificados.
- `frontend/specs/`: requisitos de comportamento das telas consumidoras, incluindo cardápios, notícias, mensagens, estoque e login.
- Controllers, DTOs e `SecurityConfig` existentes: descrevem a implementação atual, que pode divergir dos requisitos anteriores.

Quando este documento e o contrato DTO discordarem, a divergência deve ser registrada e resolvida antes de alterar o backend ou adaptar a interface. Esta especificação não autoriza mudanças em segurança, regras de negócio ou visual.

## Escopo

- Integrar os serviços de dados existentes em `frontend/src/services/` com os endpoints disponíveis.
- Centralizar a configuração da URL base da API e o tratamento de respostas HTTP.
- Definir os formatos de requisição e resposta e as conversões entre os modelos de tela e os DTOs.
- Substituir os mocks por respostas da API nos fluxos que tiverem contrato confirmado.
- Manter os estados de carregamento, vazio, erro e sucesso já previstos nas telas.
- Documentar lacunas entre operações e campos existentes na interface e os disponibilizados pela API.

## Fora do escopo e restrições

- Alterar cores, tipografia, estrutura, rótulos ou qualquer aspecto visual existente.
- Alterar regras de negócio, autenticação, autorização, CORS ou a configuração de segurança do backend.
- Introduzir uma nova biblioteca HTTP ou outra dependência sem necessidade aprovada.
- Criar endpoints, propriedades de DTO, permissões, tokens ou regras de autenticação por suposição.
- Implementar integrações para operações que ainda não possuam contrato HTTP definido.

## Requisitos funcionais

### RF001 — Configuração do endereço da API

A aplicação deve obter o endereço de origem do backend de uma variável de ambiente pública do frontend, por exemplo `NEXT_PUBLIC_API_BASE_URL`. O valor não deve conter barra final nem o prefixo `/api`; os serviços acrescentam esse prefixo ao construir os caminhos. Em desenvolvimento local, o valor correspondente à porta padrão documentada do backend é `http://localhost:8080`. O endereço não deve ficar espalhado em componentes ou serviços.

O valor usado em cada ambiente deve ser documentado em arquivos de exemplo sem credenciais. Segredos, senhas e tokens não podem ser incluídos em variáveis públicas do frontend.

### RF002 — Chamadas HTTP centralizadas

As chamadas à API devem ocorrer por meio de módulos em `frontend/src/services/`; componentes de tela não devem construir URLs nem chamar a API diretamente.

As chamadas devem:

- usar JSON em corpos de requisição e respostas JSON, salvo endpoint cujo contrato atual declare texto ou resposta sem corpo;
- verificar o status HTTP antes de tratar a resposta como sucesso;
- tratar resposta vazia, JSON inválido e falha de rede sem encerrar a tela com erro não tratado;
- expor erros úteis aos componentes para que estes mantenham seus estados e mensagens existentes;
- evitar repetir automaticamente operações de criação, atualização ou exclusão;
- não apresentar mocks como dados persistidos quando a API estiver indisponível.

### RF003 — Consulta e persistência de cardápios

O frontend deve consumir os endpoints de semanas e refeições descritos na tabela de contratos. A lista de semanas e os itens de cardápio devem ser convertidos para o modelo já usado pelas telas.

A seleção de intervalo existente deve continuar funcionando. Como os endpoints atuais de semanas não definem parâmetros de período, o frontend deve filtrar localmente os dados recebidos até que exista um contrato aprovado para filtro no servidor.

A criação ou atualização só deve ser apresentada como concluída depois de uma resposta de sucesso da API. O corpo enviado deve respeitar os DTOs de semana e refeição, incluindo as regras de associação de refeições definidas em `backend/specs/DTOs/requirements.md`.

### RF004 — Consulta e publicação de notícias

A listagem deve consumir `GET /api/noticias`. A publicação deve consumir `POST /api/noticias` com os campos aceitos por `NoticiaCreateRequestDTO`. A resposta do servidor deve ser convertida para o modelo usado pela tela.

O filtro de período deve ser aplicado localmente enquanto a API não definir parâmetros de consulta. A interface não deve indicar publicação concluída antes da confirmação do backend.

O botão de remoção presente no mock da tela não pode ser conectado à API enquanto não houver um endpoint de exclusão documentado e implementado.

### RF005 — Consulta, envio e remoção de mensagens

A consulta e as operações de mensagem devem seguir os endpoints atuais de `/api/mensagens` e seus DTOs. A remoção só deve ser confirmada na interface após `204 No Content`. A criação exige o identificador do usuário na rota, conforme contrato atual.

Os campos da mensagem devem ser convertidos para o modelo da tela. O filtro de período deve permanecer local até a API definir parâmetros para ele.

Nome e contato do remetente exibidos ou usados por telas existentes só podem vir da API quando houver campos definidos no contrato. O frontend não deve inventar esses dados nem inferi-los a partir do identificador do usuário.

### RF006 — Consulta e cadastro de estoque

A listagem e o cadastro devem seguir `GET /api/estoque` e `POST /api/estoque`, usando `EstoqueResponseDTO` e `EstoqueCreateRequestDTO`.

Campos derivados, como estado de validade, só podem ser calculados quando a regra correspondente estiver definida no domínio. Como o DTO atual de estoque não define um campo de status nem a regra completa de derivação, não inferir esse estado a partir de datas sem confirmação.

Edição e exclusão de estoque não devem ser conectadas enquanto não houver endpoints e contratos correspondentes.

### RF007 — Tratamento de erro e validação

O frontend deve tratar, no mínimo, os seguintes resultados sem perder dados digitados:

- `400 Bad Request`: entrada rejeitada pelo backend; quando houver `ApiErrorDTO`, ler `code` e `message`;
- `401 Unauthorized`: autenticação ausente ou inválida, quando aplicável ao contrato confirmado;
- `403 Forbidden`: perfil sem permissão, quando aplicável ao contrato confirmado;
- `404 Not Found`: recurso ou usuário relacionado inexistente, conforme endpoint;
- falha de rede ou indisponibilidade: manter os dados do formulário e informar que a operação não foi concluída.

A forma genérica do erro deve seguir a resposta já definida pelo backend; o frontend não deve exibir stack traces ou detalhes internos.

## Regras de negócio e integração

- **RN01 — Preservação de comportamento:** a integração deve preservar os fluxos visuais e as regras já existentes. Mudanças necessárias para suportar a API que alterem um fluxo devem ser registradas como pendência, não implementadas implicitamente.
- **RN02 — Compatibilidade:** método, rota, nomes JSON, códigos de status e permissões devem seguir os contratos existentes até que uma alteração seja aprovada e especificada.
- **RN03 — Datas e horários:** datas no contrato da API usam `yyyy-MM-dd`; horários usam ISO-8601 (`HH:mm:ss`). O frontend deve evitar deslocamento de data por fuso horário e formatar a apresentação conforme o padrão brasileiro já adotado nas telas.
- **RN04 — Coleções:** coleções sem registros são listas vazias. A interface deve usar o estado vazio existente, não interpretar `null` como uma lista válida.
- **RN05 — Persistência confirmada:** após erro de gravação, o frontend deve manter os dados digitados e não atualizar a interface como se a operação tivesse sido persistida.
- **RN06 — Segurança e dados:** não guardar credenciais no código versionado ou em armazenamento público do navegador sem contrato aprovado. Não ampliar permissões de endpoints nem expor dados internos retornados pelo backend.
- **RN07 — Dependências:** usar as APIs nativas disponíveis no projeto para HTTP, salvo justificativa e aprovação para dependência adicional.
- **RN08 — Sem fallback silencioso:** falha da API não deve trocar silenciosamente para mocks como se estes fossem dados atuais. Dados fictícios podem permanecer em desenvolvimento apenas se estiverem identificados e se o modo de uso for configurado explicitamente.
- **RN09 — Acesso de origem:** chamadas entre origens só podem funcionar a partir de origens autorizadas pelo backend. A lista de origens deve ser confirmada; esta especificação não autoriza alterar CORS ou demais controles de segurança.

## Contratos HTTP de referência

Os caminhos e os formatos de sucesso abaixo refletem `backend/specs/DTOs/requirements.md` e os controllers existentes. Os campos detalhados de cada DTO permanecem definidos naquela especificação.

| Método e caminho | Uso no frontend | Sucesso documentado |
|---|---|---|
| `POST /api/auth/login` | Login | Implementação atual retorna texto com `200` ou texto com `401`; ver pendência de autenticação |
| `GET /api/usuarios` | Consulta administrativa de usuários | `200`, lista de `UsuarioResponseDTO` |
| `POST /api/usuarios` | Cadastro de usuário | `200`, `UsuarioResponseDTO` |
| `GET /api/semanas` | Consulta de cardápios semanais | `200`, lista de `SemanaResponseDTO` |
| `POST /api/semanas` | Criação de semana/cardápio | `200`, `SemanaResponseDTO` |
| `PUT /api/semanas/{data}` | Atualização de semana | `200`, `SemanaResponseDTO`; `404` se não existir |
| `GET /api/refeicoes` | Consulta de refeições | `200`, lista de `RefeicaoResponseDTO` |
| `POST /api/refeicoes` | Criação de refeição | `200`, `RefeicaoResponseDTO` |
| `GET /api/noticias` | Consulta pública de notícias | `200`, lista de `NoticiaResponseDTO` |
| `POST /api/noticias` | Publicação de notícia | `200`, `NoticiaResponseDTO` |
| `GET /api/mensagens` | Consulta de mensagens | `200`, lista de `MensagemResponseDTO` |
| `GET /api/mensagens/{id}` | Consulta de uma mensagem | `200`, `MensagemResponseDTO`; `404` se não existir |
| `POST /api/mensagens/usuario/{usuarioId}` | Envio de mensagem associada a usuário | `200`, `MensagemResponseDTO`; `404` se usuário não existir |
| `PUT /api/mensagens/{id}` | Atualização de mensagem | `200`, `MensagemResponseDTO`; `404` se não existir |
| `DELETE /api/mensagens/{id}` | Remoção de mensagem | `204`, sem corpo; `404` se não existir |
| `GET /api/estoque` | Consulta de estoque | `200`, lista de `EstoqueResponseDTO` |
| `POST /api/estoque` | Cadastro de item | `200`, `EstoqueResponseDTO` |

A implementação atual do backend possui tratamento `400` e `404` com `ApiErrorDTO(code, message)` para exceções tratadas. Outros erros devem ser interpretados pelo status HTTP e não podem ser presumidos como tendo o mesmo corpo sem confirmação.

## Conversão de modelos

A conversão entre DTOs e modelos da interface deve ficar nos serviços ou em adaptadores puros reutilizáveis, nunca nos componentes visuais. A tabela abaixo registra equivalências semânticas conhecidas; campos sem equivalente confirmado devem aguardar decisão.

| Modelo de tela ou mock | Campo de API relacionado | Observação |
|---|---|---|
| Notícia: `titulo` | `assunto` | Equivalência de apresentação; escrita e leitura devem manter o texto |
| Notícia: `duracaoHoras` | `duracao` | Unidade da API é hora |
| Mensagem: `titulo` | `assunto` | Equivalência de apresentação |
| Mensagem: `hora` | `horario` | A API serializa horário como `HH:mm:ss`; a tela pode exibir `HH:mm` |
| Estoque: `id` | `idMaterial` | Identificador gerado somente para resposta |
| Estoque: `dataEntrega` | `dataDeRecebimento` | Confirmar significado junto ao contrato do campo |
| Estoque: `dataValidade` | `dataDeValidade` | Formato da API `yyyy-MM-dd` |
| Estoque: `observacao` | `observacoes` | Conversão de singular para plural |
| Estoque: `status` | Sem campo correspondente no DTO atual | Não derivar sem regra de domínio confirmada |

Os modelos de cardápio possuem nomes e campos que não coincidem integralmente com `RefeicaoRequestDTO` e `RefeicaoResponseDTO`. A interface também contém campos sem correspondência explícita na tabela do DTO, como salada. O mapeamento não pode descartar esses valores sem uma decisão de produto e de contrato.

## Critérios de aceitação

### Cenário 1 — Configuração por ambiente

**Dado que** o frontend está configurado para um ambiente  
**Quando** um serviço faz uma chamada HTTP  
**Então** a chamada usa a URL base configurada para aquele ambiente  
**E** a URL não contém credenciais ou tokens.

### Cenário 2 — Consulta de coleção

**Dado que** uma consulta retorna dados válidos  
**Quando** a API responde com `200` e uma lista JSON  
**Então** o serviço converte os DTOs para o modelo da interface  
**E** uma lista vazia aciona o estado vazio existente.

### Cenário 3 — Datas e horários

**Dado que** a API responde com datas `yyyy-MM-dd` e horários ISO-8601  
**Quando** os dados são exibidos ou usados em filtros  
**Então** as datas permanecem no dia correto sem deslocamento de fuso  
**E** a apresentação segue a formatação brasileira já usada no frontend.

### Cenário 4 — Erro de validação ou autorização

**Dado que** a API responde com `400`, `401` ou `403` para um formulário ou consulta  
**Quando** o frontend processa a resposta  
**Então** apresenta o estado de erro previsto para a tela  
**E** não apresenta a operação como concluída  
**E** preserva os dados digitados no formulário.

### Cenário 5 — Recurso inexistente

**Dado que** a API responde com `404`  
**Quando** o frontend processa o resultado  
**Então** informa que o registro relacionado não foi encontrado  
**E** não atualiza a interface como se a operação tivesse sido concluída.

### Cenário 6 — Indisponibilidade da API

**Dado que** a API não pode ser alcançada ou retorna uma resposta inesperada  
**Quando** o frontend consulta ou envia dados  
**Então** mantém a página utilizável, exibe o estado de erro existente e não troca silenciosamente para dados mockados.

### Cenário 7 — Operação sem endpoint

**Dado que** uma ação visual não possui endpoint correspondente na tabela  
**Quando** o usuário aciona essa ação  
**Então** ela não deve ser simulada como persistida pela integração  
**E** a lacuna deve ser resolvida por requisito e contrato aprovados antes de implementar a chamada.

### Cenário 8 — Preservação do visual e das regras existentes

**Dado que** os serviços frontend são conectados à API  
**Quando** os dados passam a vir do backend  
**Então** a integração mantém o visual e os fluxos existentes  
**E** não altera autenticação, autorização, CORS ou regras de negócio sem especificação e autorização próprias.

## Decisões pendentes antes da integração completa

1. **Autenticação:** o formulário e o mock do frontend usam usuário e senha; `POST /api/auth/login` recebe `email` e `senha`, responde com texto simples e não define token ou sessão consumível. Definir o identificador de login, o formato de sucesso/erro e o mecanismo de sessão antes de substituir o mock.
2. **Segurança efetiva:** `SecurityConfig` atualmente permite todas as rotas `/api/**`, enquanto a especificação DTO descreve acesso autenticado e papéis em vários endpoints. Confirmar qual requisito de acesso é vigente. Esta especificação não autoriza alterar a configuração.
3. **CORS e ambientes:** os controllers de autenticação e usuários declaram origens de `localhost:5173`, enquanto o frontend usa Next.js. Confirmar as origens válidas para desenvolvimento e produção antes de alterar CORS.
4. **Campos de cardápio:** decidir o destino de salada e a conversão entre os nomes dos campos da tela e os de refeição do DTO.
5. **Notícias:** a interface possui remoção, mas a API documenta apenas consulta e criação. Definir se remoção será retirada do fluxo ou se um endpoint será especificado.
6. **Mensagens:** a criação exige `usuarioId`, mas o formulário público e o mock não definem como obter esse ID. O DTO também não contém nome nem contato do remetente. Definir o fluxo para mensagens anônimas e os dados que podem ser exibidos.
7. **Estoque:** a interface possui edição e exclusão, mas a API atual documenta apenas consulta e criação. Definir se essas ações serão removidas do fluxo ou se seus contratos serão especificados.
8. **Identificador de notícia:** a tabela do contrato DTO lista `idMensagem` em `NoticiaResponseDTO`; confirmar se esse é o nome deliberado ou um erro antes de consumi-lo.

## Pronto quando

- Os contratos e decisões pendentes necessários para cada fluxo tiverem sido confirmados.
- Os serviços frontend consumirem os endpoints existentes sem duplicar chamadas em componentes.
- Os modelos de tela forem convertidos sem perda silenciosa de campos.
- Estados de carregamento, vazio, erro e sucesso funcionarem com dados reais.
- A integração preservar o visual e não alterar segurança ou regras de negócio fora de uma especificação aprovada.

