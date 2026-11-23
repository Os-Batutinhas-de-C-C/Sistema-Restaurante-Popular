# Design — Oficinas ou Cursos

## Context

O Portal do Cidadão monta o conteúdo público em `mainPage/main` antes do rodapé. O Painel Gestor usa `ProtectedRoute`, a variante Gestor de `NavbarPainel` e serviços de consulta pelo proxy do Next.js. No backend, `SecurityConfig` admite o Gestor apenas nas operações autorizadas explicitamente e rejeita esse papel no fallback de `/api/**`. Os novos contratos precisam distinguir a programação pública, a consulta própria de inscrições e a administração autenticada.

## Goals / Non-Goals

Usar os padrões de tela, navegação e persistência existentes. Manter a publicação, as vagas e os conflitos de horário coerentes entre Portal do Cidadão, Painel Gestor e API. Entregar a confirmação de inscrição na tela.

## Decisions

### Dados e datas

Persistir eventos e inscrições como registros relacionados. O evento tem um identificador próprio, os dados de cadastro e uma versão para edições concorrentes. A inscrição referencia o evento e contém CPF normalizado, data de nascimento e e-mail. Uma restrição única por evento e CPF sustenta a regra de inscrição ativa única. A exclusão do evento remove as inscrições dependentes no mesmo commit.

Representar o horário com `horaInicio` e `horaFim`, ligados à mesma `data`. Validar `inicio < fim` no serviço e calcular início, fim, publicação, edição e prazos de inscrição com relógio injetável em `America/Fortaleza`. Considerar o início como a primeira hora do intervalo e o fim como a primeira hora fora dele. Isso permite que o mesmo CPF participe de eventos consecutivos e detecta qualquer sobreposição real.

O formulário e a API usam os mesmos limites, com `title` exibido como “Título”. Validar os 60 caracteres do título e os 150 de local e instrutor como caracteres Unicode. Converter local e instrutor para maiúsculas preservando acentos e validar a regra de letras e espaços de instrutor na API. Usar texto de comprimento variável para a descrição. Preservar a capacidade e a contagem como inteiros exatos em PostgreSQL e no backend, representando os valores em decimal na integração com JavaScript. Calcular vagas restantes pela contagem de inscrições ativas. O e-mail é validado e o CPF é armazenado sem pontuação para comparações.

### Contratos e autorização

Usar DTOs diferentes para cartões públicos, formulários administrativos e lista de inscritos. Reutilizar `apiClient` e manter as chamadas da funcionalidade em `src/services/`. A API pode representar o intervalo com uma data ISO e dois horários locais.

| Operação | Método e rota | Acesso |
|---|---|---|
| Consultar programação publicada | `GET /api/oficinas-ou-cursos/publicas` | Público |
| Inscrever visitante | `POST /api/oficinas-ou-cursos/publicas/{id}/inscricoes` | Público, com dados do inscrito no corpo |
| Consultar Minhas inscrições | `POST /api/oficinas-ou-cursos/publicas/minhas-inscricoes` | Público, limitado ao CPF e à data de nascimento apresentados |
| Cancelar a própria inscrição | `POST /api/oficinas-ou-cursos/publicas/{id}/cancelamentos` | Público, com verificação de CPF e data de nascimento no servidor |
| Listar e cadastrar eventos | `GET` e `POST /api/oficinas-ou-cursos` | Gestor |
| Carregar, editar e remover evento | `GET`, `PUT` e `DELETE /api/oficinas-ou-cursos/{id}` | Gestor |
| Listar inscritos e cancelar inscrição | `GET /api/oficinas-ou-cursos/{id}/inscricoes` e `DELETE /api/oficinas-ou-cursos/{id}/inscricoes/{inscricaoId}` | Gestor |

Registrar as exceções públicas por método e caminho e aplicar `hasRole("GESTOR")` ao restante desse recurso antes do fallback de `/api/**`. Resolver a inscrição a cancelar pelo evento e pela identidade apresentada, mesmo quando a ação parte de um resultado de “Minhas inscrições”. As respostas públicas e pessoais usam dados do evento, disponibilidade e resultado da operação. Reservar CPF, data de nascimento e e-mail completos para o DTO do diálogo administrativo. Enviar esses campos no corpo das requisições e mantê-los fora dos logs e dos endereços de navegação.

### Inscrições concorrentes e confirmação de reagendamento

Verificar lotação, CPF duplicado, prazo e sobreposição na mesma transação que grava a inscrição. Compartilhar essa coordenação entre inscrição, cancelamento, alteração de capacidade, reagendamento e remoção de evento. Usar transações serializáveis e repetição limitada em uma transação nova para conflitos de serialização no PostgreSQL. Recalcular capacidade, horário e sobreposições a cada tentativa. A restrição única oferece uma proteção adicional para tentativas repetidas no mesmo evento.

Ao editar o intervalo, calcular quais inscrições ativas conflitariam com outro evento de cada CPF. Se houver conflito, a API retorna a contagem e uma referência de confirmação vinculada à versão do evento, ao intervalo proposto e ao conjunto de inscrições afetadas. O formulário mostra essa contagem e mantém os dados digitados. Após a confirmação, recalcular os conflitos na mesma transação que grava o evento. Se o conjunto mudou, atualizar o aviso. Se a confirmação corresponde ao conjunto atual, atualizar o evento e remover apenas suas inscrições conflitantes em uma única gravação.

### Tela pública e área do Gestor

Inserir “Oficinas ou Cursos” como a última seção de conteúdo de `mainPage/main`, antes do rodapé. Renderizar os dados do evento e os totais de vagas em cartões responsivos. Reutilizar os cartões no Painel Gestor com um botão de gerenciamento junto à seção. Atualizar disponibilidade após operações confirmadas e revalidar a programação nas transições de horário para apresentar o início e o fim conforme a referência do servidor.

Usar um MUI Dialog para “Inscrever-se” e o formulário “Minhas inscrições” em linha, abaixo da programação. O formulário pessoal mantém CPF e data de nascimento em memória durante a consulta e o cancelamento. Recarregar a listagem e “Minhas inscrições” depois de um cancelamento confirmado. Mostrar os estados de carregamento, vazio, falha e sucesso em português.

Adicionar `/painel-gestor/oficinas-ou-cursos`, com páginas próprias `novo` e `[id]/editar`, todas protegidas pelo papel Gestor. Adicionar o destino à variante Gestor de `NavbarPainel`. Na lista, oferecer os filtros de data, início e fim, “Novo evento”, edição conforme o horário e remoção por confirmação. A ação “Inscrições” nos eventos salvos abre o diálogo com o cadastro dos participantes e permite cancelamento até o início. O formulário segue os cartões e controles do [Gerenciamento de Cardápio](<../../../../frontend/docs/interface/002-gerenciamento-cardapio/PAINEL NUTRICIONISTA - GERENCIAMENTO CARDAPIO.png>).

## Risks / Trade-offs

- Dois visitantes podem tentar ocupar a última vaga ou o mesmo CPF pode tentar dois eventos sobrepostos. Testar a coordenação em PostgreSQL com requisições concorrentes.
- Uma inscrição pode mudar depois que o Gestor recebeu o aviso de reagendamento. Validar a confirmação contra o conjunto atual antes de gravar.
- O fim do evento pode ocorrer com uma página aberta. Usar os prazos do servidor como autoridade para os controles de inscrição e cancelamento e revalidar a listagem nos limites de horário.

## Migration Plan

Criar uma migração versionada em `backend/migrations/` para as tabelas de eventos e inscrições, suas chaves e índices. Documentar sua aplicação no fluxo existente de PostgreSQL com `ddl-auto=validate`. A migração é aditiva, e um rollback de código pode preservar as novas tabelas e seus dados.

Ao arquivar este delta, integrar primeiro `add-painel-gestor` e depois `restrict-gestor-access` na especificação principal `painel-gestor`. A implementação usa a base das duas mudanças já aplicadas ao código.
