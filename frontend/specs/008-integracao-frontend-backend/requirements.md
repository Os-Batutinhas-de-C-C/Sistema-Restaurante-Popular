# Requisitos — Integração entre Frontend e Backend

## Aditivo de decisões do solicitante — 02/11/2026

As decisões registradas em [`change-log.md`](./change-log.md) atualizam este documento e prevalecem sobre as restrições e pendências históricas abaixo. O trabalho autorizado inclui as alterações necessárias no frontend, backend e PostgreSQL, usando login por e-mail/senha com JWT Bearer em memória por uma hora e a matriz de acesso da spec DTO. Não alterar CORS. O plano e os testes focados de segurança foram aprovados. A leitura pública do cardápio usa rota separada, somente leitura, que não retorna métricas administrativas. Não há definições de produto pendentes.

**Aditivo de 03/11/2026:** o solicitante autorizou adicionar ao painel do Caixa uma navbar no modelo da navbar existente, reutilizando seus assets, com título “Painel do Caixa” e dropdown contendo somente “Sair”. O espaço superior do conteúdo pode ser ajustado para acomodar a barra fixa.

## Objetivo

**Aditivo de fichas aprovado — 03/11/2026:** os indicadores das telas pública, Nutricionista/Gestor e Caixa representam um único total de fichas entregues. Cada clique confirmado soma uma ficha; o limite diário é 300. A contagem usa o dia de `America/Fortaleza`, funciona de segunda a sexta mesmo sem cardápio cadastrado e preserva os dias anteriores. A leitura do total de hoje é pública; somente Caixa pode registrar fichas. Os testes focados de permissões e concorrência foram autorizados.

**Aditivo de Meu Perfil — 03/11/2026:** o solicitante autorizou integrar a própria conta ao backend e distinguir Nutricionista/Gestor de Caixa. Foram aprovados os endpoints pessoais, identidade pelo JWT, papel somente leitura, senha atual para mudar e-mail/senha, e-mail único, nova senha de seis caracteres Unicode no mínimo e 72 bytes UTF-8 no máximo, e revogação imediata de todos os tokens anteriores por versão persistida. A comparação de e-mail preserva o contrato existente, sensível a maiúsculas/minúsculas. Alterar somente o nome mantém a sessão e sua expiração.

Conectar os serviços do frontend Next.js à API Spring Boot para consultar e persistir os dados do Restaurante Popular, mantendo a interface existente. Este documento define os limites da integração, os contratos HTTP de referência, a conversão entre os dados exibidos pela interface e os DTOs da API, além das decisões que precisam ser confirmadas antes de implementar comportamentos ainda indefinidos.

## Referências e fonte do contrato

- `fetch.md`: não alterar o visual do frontend nem as regras de segurança ou de negócio do backend; manter dependências adicionais no mínimo; esclarecer ambiguidades antes de decisões críticas.
- `backend/specs/DTOs/requirements.md`: referência principal dos endpoints, DTOs, campos JSON, status HTTP e permissões atualmente especificados.
- `frontend/specs/`: requisitos de comportamento das telas consumidoras, incluindo cardápios, notícias, mensagens, estoque e login.
- Controllers, DTOs e `SecurityConfig` existentes: descrevem a implementação atual, que pode divergir dos requisitos anteriores.

O aditivo aprovado e `backend/specs/DTOs/requirements.md` definem os contratos vigentes. Mudanças de segurança, regras de negócio e schema limitam-se às decisões registradas no aditivo; preservar a interface visual sempre que possível.

## Escopo

- Integrar os serviços de dados existentes em `frontend/src/services/` com os endpoints disponíveis.
- Centralizar a configuração da URL base da API e o tratamento de respostas HTTP.
- Definir os formatos de requisição e resposta e as conversões entre os modelos de tela e os DTOs.
- Substituir os mocks por respostas da API nos fluxos que tiverem contrato confirmado.
- Manter os estados de carregamento, vazio, erro e sucesso já previstos nas telas.
- Documentar lacunas entre operações e campos existentes na interface e os disponibilizados pela API.

## Fora do escopo e restrições

- Alterar cores, tipografia, estrutura, rótulos ou qualquer aspecto visual existente.
- Alterar CORS ou fazer mudanças fora do escopo explicitamente aprovado.
- Introduzir uma nova biblioteca HTTP ou outra dependência sem necessidade aprovada.
- Criar endpoints, propriedades de DTO, permissões, tokens ou regras de autenticação por suposição.
- Implementar integrações para operações que ainda não possuam contrato HTTP definido.

## Requisitos funcionais

### RF001 — Configuração do endereço da API

A aplicação deve obter o endereço de origem do backend de uma variável de ambiente exclusiva do servidor Next.js, `BACKEND_API_BASE_URL`. O valor não deve conter barra final nem o prefixo `/api`. Em desenvolvimento local, o valor correspondente à porta padrão documentada do backend é `http://localhost:8080`. O endereço não deve ficar espalhado em componentes ou serviços.

**Decisão confirmada pelo solicitante:** usar proxy/rewrite de mesma origem do Next.js para encaminhar `/api/:path*` ao backend. Os componentes e serviços chamam caminhos relativos `/api/...`; o navegador não chama diretamente a origem Spring. Não alterar CORS no backend para atender ao frontend.

**Correção autorizada em 03/11/2026:** antes do rewrite, o proxy valida o cabeçalho `Origin`, quando presente, contra o protocolo e o `Host` da requisição ao Next.js. Origens diferentes, opacas (`null`) ou malformadas recebem `403` com `ApiErrorDTO`; `X-Forwarded-Host` não autoriza origens. Requisições identificadas por `Sec-Fetch-Site` como `same-site` ou `cross-site` também são rejeitadas. Chamadas sem `Origin`, como GETs da própria página e clientes de API, continuam funcionando. Somente após essa validação, o proxy remove `Origin` da requisição ao Spring, preservando corpo, método e `Authorization`. Isso corrige o login no navegador sem alterar CORS, JWT ou permissões do backend.

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

**Decisão confirmada pelo solicitante:** os dias não são enviados em cada refeição. `Semana.data` identifica a segunda-feira e a posição no array `cardapio` identifica o dia: índices `0` a `4` representam segunda a sexta. O array tem exatamente cinco posições; `null` representa dia sem refeição. A persistência conserva as posições. Vínculos legados sem ordem são migrados em ordem crescente de ID da refeição, aceitando que dias antigos possam ficar incorretos.

A seleção de intervalo existente deve continuar funcionando. Como os endpoints atuais de semanas não definem parâmetros de período, o frontend deve filtrar localmente os dados recebidos até que exista um contrato aprovado para filtro no servidor.

A criação ou atualização só deve ser apresentada como concluída depois de uma resposta de sucesso da API. O corpo enviado deve respeitar os DTOs de semana e refeição, incluindo as regras de associação de refeições definidas em `backend/specs/DTOs/requirements.md`.

### RF004 — Consulta e publicação de notícias

A listagem consome `GET /api/noticias`; a publicação usa `POST /api/noticias` com o JWT da sessão e os campos de `NoticiaCreateRequestDTO`. O autor é associado pelo backend. A interface respeita os limites do DTO e só mostra sucesso após confirmação da API. A remoção usa `DELETE /api/noticias/{id}`.

O filtro de período deve ser aplicado localmente enquanto a API não definir parâmetros de consulta. A interface não deve indicar publicação concluída antes da confirmação do backend.

O filtro de período continua local enquanto a API não definir parâmetros de consulta.

### RF005 — Consulta e exibição de mensagens

A lista consome `GET /api/mensagens` e converte os campos do DTO. Usuários com os papéis permitidos podem excluir mensagens por `DELETE /api/mensagens/{id}`. O formulário público envia assunto e texto a `POST /api/mensagens/publicas`, sem usuário, nome ou contato.

Os campos da mensagem devem ser convertidos para o modelo da tela. O filtro de período deve permanecer local até a API definir parâmetros para ele.

Nome e contato do remetente exibidos ou usados por telas existentes só podem vir da API quando houver campos definidos no contrato. O frontend não deve inventar esses dados nem inferi-los a partir do identificador do usuário.

### RF006 — Consulta e cadastro de estoque

A listagem e o cadastro consomem `GET`/`POST /api/estoque`; edição e exclusão usam `PUT`/`DELETE /api/estoque/{idMaterial}`. O status é calculado a partir da validade pela API e não é enviado pelo formulário.

“Vence em breve” cobre a validade entre hoje e sete dias adiante; “Vencido” começa no dia seguinte à validade. A API calcula e retorna o status.

O frontend preserva os dados do formulário se a API rejeitar a gravação.

### RF007 — Tratamento de erro e validação

O frontend deve tratar, no mínimo, os seguintes resultados sem perder dados digitados:

- `400 Bad Request`: entrada rejeitada pelo backend; quando houver `ApiErrorDTO`, ler `code` e `message`;
- `409 Conflict`: e-mail de login já utilizado ou registro de fichas bloqueado; associar `EMAIL_IN_USE` ao campo de e-mail e manter os valores digitados. Para fichas, mostrar o motivo e consultar o estado atual, sem repetir o POST;
- `401 Unauthorized`: autenticação ausente ou inválida, quando aplicável ao contrato confirmado;
- `403 Forbidden`: perfil sem permissão, quando aplicável ao contrato confirmado;
- `404 Not Found`: recurso ou usuário relacionado inexistente, conforme endpoint;
- falha de rede ou indisponibilidade: manter os dados do formulário e informar que a operação não foi concluída.

A forma genérica do erro deve seguir a resposta já definida pelo backend; o frontend não deve exibir stack traces ou detalhes internos.

### RF008 — Meu Perfil integrado

A tela consulta `GET /api/usuarios/me` e exibe nome, e-mail e nível de acesso da própria conta. O nível é somente leitura. Nutricionista/Gestor usam a navbar completa; Caixa usa “Painel do Caixa” com somente “Sair”. Os dados fictícios são removidos e as chamadas ficam em `perfilService.js`.

“Salvar Informações” envia `PerfilUpdateRequestDTO(nome, emailRecuperacao, senhaAtual)` a `PUT /api/usuarios/me` e recebe `PerfilUpdateResponseDTO(usuario, requerNovoLogin)`. Nome/e-mail são obrigatórios, recebem trim e aceitam até 255 caracteres Unicode; e-mail deve ter conteúdo antes/depois de `@`, sem espaços. A senha atual é exigida quando o e-mail mudar. Nome apenas atualiza os dados da sessão sem renovar token ou `expiresAt`; mudança de e-mail limpa a sessão e abre o login com confirmação da alteração.

“Atualizar Senha” envia `SenhaUpdateRequestDTO(senhaAtual, novaSenha, confirmacaoSenha)` a `PUT /api/usuarios/me/senha`. A nova senha exige pelo menos seis pontos de código Unicode, no máximo 72 bytes UTF-8 e confirmação igual; sucesso `204` limpa a sessão e exige novo login. O backend valida a propriedade da conta e revoga todos os tokens anteriores após e-mail/senha alterados. Senhas incorretas e entradas inválidas retornam `400`; e-mail em uso retorna `409`; sessão inválida retorna `401`.

Carregamento, falha com repetição, salvamento e sucesso devem ter estados explícitos. Erros ficam próximos ao campo/formulário, mantendo os dados digitados. Nenhuma resposta de perfil contém senha, hash, salt, token ou versão de credenciais.

### RF009 — Fichas entregues sincronizadas

As três telas consultam `GET /api/fichas/hoje`, que retorna `data`, `entregues`, `capacidade`, `restantes` e `permiteAdicionar`. Contagem zero é um dado válido; falhas não podem ser substituídas por valores de demonstração. Capacidade, percentual e restantes usam a mesma resposta. Nos fins de semana, a consulta retorna total zero e registro desabilitado.

O botão do Caixa envia `POST /api/fichas/hoje/incrementos`, sem escolher data nem quantidade. O backend soma exatamente um ao total persistido de hoje e responde com o novo estado; o botão fica desabilitado durante a solicitação, fora dos dias úteis ou ao atingir 300. Não há incremento otimista nem repetição automática de gravações. Limite atingido ou dia fechado retorna `409`, com `FICHAS_LIMIT_REACHED` ou `FICHAS_CLOSED_DAY`.

As telas atualizam a leitura a cada cinco segundos enquanto visíveis, ao recuperar o foco e na atualização manual disponível. O Caixa aplica imediatamente a resposta confirmada do registro. Carregamento, zero, erro, tentativa novamente e sucesso devem ser explícitos, sem mostrar dados antigos como atuais. A data de referência vem do servidor, inclusive na virada do dia; o histórico semanal continua usando os mesmos registros.

## Regras de negócio e integração

- **RN01 — Preservação de comportamento:** preservar os fluxos visuais existentes, exceto pelos comportamentos de integração explicitamente aprovados e registrados.
- **RN02 — Compatibilidade:** método, rota, nomes JSON e status seguem os contratos da spec DTO atualizada; alterações aprovadas constam do aditivo.
- **RN03 — Datas e horários:** datas no contrato da API usam `yyyy-MM-dd`; horários usam ISO-8601 (`HH:mm:ss`). O frontend deve evitar deslocamento de data por fuso horário e formatar a apresentação conforme o padrão brasileiro já adotado nas telas.
- **RN04 — Coleções:** coleções sem registros são listas vazias. A interface deve usar o estado vazio existente, não interpretar `null` como uma lista válida.
- **RN05 — Persistência confirmada:** após erro de gravação, o frontend deve manter os dados digitados e não atualizar a interface como se a operação tivesse sido persistida.
- **RN06 — Segurança e dados:** manter o JWT somente em memória no frontend e enviá-lo como Bearer. Aplicar no backend a matriz de acesso aprovada; não expor dados internos.
- **RN07 — Dependências:** usar as APIs nativas disponíveis no projeto para HTTP, salvo justificativa e aprovação para dependência adicional.
- **RN08 — Sem fallback silencioso:** falha da API não deve trocar silenciosamente para mocks como se estes fossem dados atuais. Dados fictícios podem permanecer em desenvolvimento apenas se estiverem identificados e se o modo de uso for configurado explicitamente.
- **RN09 — Acesso de origem:** usar o proxy Next de mesma origem; CORS do backend permanece inalterado.

- **RN10 — Proxy de mesma origem:** chamadas do navegador usam o caminho `/api/...` do Next.js, encaminhado por rewrite ao endereço server-side `BACKEND_API_BASE_URL`. Não expor a origem do backend em variável `NEXT_PUBLIC_*` nem alterar CORS do backend nesta funcionalidade.

- **RN11 — Navegação autenticada do dashboard:** os botões de perfil e edição do cardápio usam `router.push()` para conservar a sessão JWT em memória durante a navegação. O perfil abre `/meuPerfil`; editar cardápio conserva a rota `/painel-nutricionista-cardapio/gerenciar/{dataIso}`, com a lista de cardápios como fallback quando não houver data. “Publicar Nova Notícia” abre `/painel-nutricionista-noticias` e “Atualizar Estoque” abre `/painel-nutricionista-estoque`. Registrar desperdício continua abrindo o diálogo existente. A correção foi solicitada em 03/11/2026.

- **RN12 — Navbar do Caixa:** `/painel-caixa` reutiliza a navbar compartilhada, seus ícones e estilos, com título “Painel do Caixa” e somente “Sair” no dropdown. Sair executa o encerramento de sessão existente antes de navegar a `/mainPage`. O conteúdo fica abaixo da barra fixa de 64 px, mantendo o espaço original de 28 px. O acesso à página continua restrito ao perfil Caixa.

- **RN13 — Identidade e sessão no perfil:** a conta é resolvida pelo JWT validado, sem ID ou papel escolhido no formulário. O backend revalida `tokenVersion` após bloquear a conta para atualização. E-mail/senha alterados invalidam todos os tokens anteriores; nome apenas mantém token e expiração. A apresentação distingue Caixa de Nutricionista/Gestor, mantendo o nível somente leitura.

- **RN14 — Contagem de fichas:** fichas entregues têm uma única fonte persistente em `semana_fichas`, com posição `0–4` derivada de segunda a sexta. A ausência de semana não impede registrar: o backend inicializa a semana sem refeições. Incrementos concorrentes e edições de cardápio preservam a contagem; `fichasVendidas` permanece como nome histórico de saída da API semanal, mas o valor enviado em cadastro/edição de cardápio deixa de alterar fichas. Essa compatibilidade evita que um formulário antigo apague entregas registradas pelo Caixa. Os rótulos dos painéis indicam fichas entregues; o gráfico semanal atualiza o índice de hoje com a consulta diária, mantendo os demais índices históricos.

## Contratos HTTP de referência

Os caminhos e os formatos de sucesso abaixo refletem `backend/specs/DTOs/requirements.md` e os controllers existentes. Os campos detalhados de cada DTO permanecem definidos naquela especificação.

| Método e caminho | Uso no frontend | Sucesso documentado |
|---|---|---|
| `POST /api/auth/login` | Login | `200`, JWT Bearer com validade de 3600 segundos e perfil; `401` JSON para credenciais inválidas |
| `GET /api/fichas/hoje` | Contador público e painéis | `200`, `FichasDiaResponseDTO`; somente data/contagem/capacidade/restantes/permissão do dia |
| `POST /api/fichas/hoje/incrementos` | Adicionar uma ficha pelo Caixa | `200`, contador confirmado; `409` limite/dia fechado; `401` sem login; `403` para outro papel |
| `GET /api/usuarios` | Consulta administrativa de usuários | `200`, lista de `UsuarioResponseDTO` |
| `POST /api/usuarios` | Cadastro de usuário | `200`, `UsuarioResponseDTO`; `409` para e-mail em uso |
| `GET /api/usuarios/me` | Consulta da própria conta | `200`, `UsuarioResponseDTO`; identidade do JWT |
| `PUT /api/usuarios/me` | Salvar nome/e-mail próprios | `200`, `PerfilUpdateResponseDTO`; `400` inválido/senha atual; `409` e-mail em uso |
| `PUT /api/usuarios/me/senha` | Alterar a própria senha | `204`, sem corpo; `400` inválido/senha atual |
| `GET /api/semanas` | Consulta de cardápios semanais | `200`, lista de `SemanaResponseDTO` |
| `POST /api/semanas` | Criação de semana/cardápio | `200`, `SemanaResponseDTO` |
| `PUT /api/semanas/{data}` | Atualização de semana | `200`, `SemanaResponseDTO`; `404` se não existir |
| `GET /api/cardapios/publicos` | Cardápio público da semana | `200`, datas e refeições sem estatísticas |
| `GET /api/refeicoes` | Consulta de refeições | `200`, lista de `RefeicaoResponseDTO` |
| `POST /api/refeicoes` | Criação de refeição | `200`, `RefeicaoResponseDTO` |
| `GET /api/noticias` | Consulta pública de notícias | `200`, lista de `NoticiaResponseDTO` |
| `POST /api/noticias` | Publicação de notícia | `200`, `NoticiaResponseDTO` |
| `DELETE /api/noticias/{id}` | Exclusão administrativa de notícia | `204`, sem corpo; `404` se não existir |
| `GET /api/mensagens` | Consulta de mensagens | `200`, lista de `MensagemResponseDTO` |
| `GET /api/mensagens/{id}` | Consulta de uma mensagem | `200`, `MensagemResponseDTO`; `404` se não existir |
| `POST /api/mensagens/usuario/{usuarioId}` | Envio de mensagem associada a usuário | `200`, `MensagemResponseDTO`; `404` se usuário não existir |
| `POST /api/mensagens/publicas` | Envio anônimo do formulário público | `200`, `MensagemResponseDTO` |
| `PUT /api/mensagens/{id}` | Atualização de mensagem | `200`, `MensagemResponseDTO`; `404` se não existir |
| `DELETE /api/mensagens/{id}` | Remoção de mensagem | `204`, sem corpo; `404` se não existir |
| `GET /api/estoque` | Consulta de estoque | `200`, lista de `EstoqueResponseDTO` |
| `POST /api/estoque` | Cadastro de item | `200`, `EstoqueResponseDTO` |
| `PUT /api/estoque/{idMaterial}` | Edição de item | `200`, `EstoqueResponseDTO`; `404` se não existir |
| `DELETE /api/estoque/{idMaterial}` | Exclusão de item | `204`, sem corpo; `404` se não existir |

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
| Estoque: `status` | `status` calculado em `EstoqueResponseDTO` | Backend deriva pela data de validade conforme a regra confirmada |
| Refeição: `saladaDoDia` | `saladaDoDia` | Persistido no modelo, DTO e schema |

O serviço de cardápio converte nomes como `pratoProteico`/`sucoNatural` para `proteina`/`suco`; `saladaDoDia` tem campo correspondente no DTO atualizado. O array de refeições mantém exatamente cinco posições em todas as conversões.

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
**Então** a integração mantém o visual sempre que possível e aplica as mudanças de autenticação/autorização aprovadas  
**E** mantém CORS do backend inalterado.

### Cenário 9 — Perfil do usuário autenticado

**Dado que** Nutricionista, Gestor ou Caixa acessa `/meuPerfil` autenticado, **quando** os dados são carregados, **então** a tela mostra a própria conta e o nível somente leitura. Caixa vê sua navbar reduzida, enquanto Nutricionista/Gestor veem o menu completo.

### Cenário 10 — Atualização e nova autenticação

**Dado que** o formulário é válido e, quando necessário, a senha atual foi confirmada, **quando** a API confirma a gravação, **então** alterar apenas o nome mantém a sessão/expiração. Alterar e-mail/senha exige novo login e invalida todos os tokens anteriores; falhas de entrada/conflito preservam os valores e exibem o erro sem anunciar sucesso.

### Cenário 11 — Mesmo total nas telas

**Dado que** Caixa, Nutricionista/Gestor e página pública estão abertos, **quando** o backend confirma uma nova ficha, **então** o Caixa mostra imediatamente o total confirmado e as demais telas visíveis passam ao mesmo total na consulta seguinte, agendada a cada cinco segundos ou ao recuperar foco. Capacidade, percentual e restantes derivam do mesmo DTO. O índice de hoje no gráfico semanal também usa esse total, sem substituir os outros dias.

### Cenário 12 — Registro, limite e dias úteis

**Dado que** há menos de 300 fichas em um dia útil de Fortaleza, **quando** Caixa aciona o botão, **então** uma única requisição soma uma ficha, sem depender de cardápio. O botão impede outra solicitação enquanto a anterior está em andamento. Ao atingir 300 ou em fins de semana, o registro fica desabilitado, com o motivo visível; o servidor também rejeita tentativas incompatíveis. Outro papel não pode registrar pela API.

### Cenário 13 — Falhas e respostas antigas

**Dado que** uma consulta ou gravação falha, **então** a tela mostra erro e oferece nova consulta, sem substituir a contagem por mock nem anunciar uma gravação não confirmada. Uma leitura iniciada antes do POST não pode restaurar um total anterior depois do sucesso. A operação de gravação não é repetida automaticamente, inclusive quando a resposta se perde.

### Cenário 14 — Novo dia sem apagar histórico

**Dado que** há fichas registradas, **quando** muda o dia no servidor em `America/Fortaleza`, **então** as telas passam à data/contagem correspondentes na atualização seguinte, sem reapresentar o dia anterior como atual. Editar o cardápio ou registrar desperdício não apaga fichas; a API mantém o histórico dos dias e semanas anteriores.

## Decisões pendentes e verificações

Nenhuma decisão de produto permanece pendente. Recuperação de senha não possui endpoint nem serviço de e-mail e permanece fora da integração. A verificação de frontend/navegador, os testes focados de segurança e a correção de origem no proxy foram autorizados; resultados e limitações estão registrados em `tasks.md`.

## Pronto quando

- Os contratos e decisões necessários para cada fluxo estiverem registrados no aditivo e no change log.
- Os serviços frontend consumirem os endpoints existentes sem duplicar chamadas em componentes.
- Os modelos de tela forem convertidos sem perda silenciosa de campos.
- Estados de carregamento, vazio, erro e sucesso funcionarem com dados reais.
- A integração preservar o visual sempre que possível, respeitar o acesso aprovado e manter CORS inalterado.

