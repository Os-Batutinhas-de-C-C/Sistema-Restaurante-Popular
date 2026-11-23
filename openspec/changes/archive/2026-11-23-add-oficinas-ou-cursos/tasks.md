# Tarefas — Oficinas ou Cursos

## 1. Eventos e acesso à API

- [x] 1.1 Criar as entidades, repositórios e migração versionada em `backend/migrations/` para eventos e inscrições. Documentar a aplicação em `backend.md` e verificar o vínculo por evento, CPF único por evento e inicialização PostgreSQL com `ddl-auto=validate` em banco isolado.
- [x] 1.2 Implementar o cadastro, a edição, a listagem com filtros e a remoção de eventos. Testar campos obrigatórios, limites e conversão para maiúsculas, aceitação de título repetido, tipo e custo, capacidade positiva, inclusão de encerrados, fim posterior ao início e bloqueio de gravação quando o evento já acabou. Verificar exclusão definitiva com inscrições vinculadas.
- [x] 1.3 Adicionar a projeção da programação pública, com capacidade e vagas restantes, e restringir as operações administrativas ao papel Gestor. Verificar a publicação ao salvar, as ordenações, as transições de horário, o acesso público e o bloqueio de outros papéis na API. Conferir a resposta pública contra a lista de campos e documentar os contratos na especificação DTO do backend.

## 2. Inscrições e mudanças de horário

- [x] 2.1 Implementar inscrição pública sem login, consulta própria e cancelamento por CPF e data de nascimento. Verificar CPF com ou sem pontuação, CPF inválido e duplicado, e-mail compartilhado, vagas restantes, resultado sem dados de terceiros, cancelamento antes do início e nova inscrição após cancelar. Conferir que o diálogo administrativo recebe os dados completos com autenticação Gestor.
- [x] 2.2 Aplicar os prazos, as regras de sobreposição e a alteração de capacidade. Testar horários parcialmente sobrepostos e consecutivos, limite de início para inscrição e cancelamento de visitante e Gestor, e tentativa de reduzir capacidade com inscrições ativas. Verificar em PostgreSQL que a última vaga e as inscrições de um CPF em eventos sobrepostos ficam consistentes sob requisições simultâneas.
- [x] 2.3 Implementar aviso e confirmação de reagendamento com conflitos. Testar desistência, confirmação válida e mudança no conjunto de conflitos entre aviso e salvamento. Verificar que a gravação preserva as outras inscrições e remove as conflitantes apenas do evento reagendado na mesma transação.

## 3. Portal do Cidadão e Painel Gestor

- [x] 3.1 Compor a seção “Oficinas ou Cursos” no fim da página inicial e no Painel Gestor com os campos públicos, as duas contagens e a ordenação definida. Verificar publicação imediata, início sem inscrições disponíveis, saída no fim e apresentação de carregamento, lista vazia e erros.
- [x] 3.2 Implementar o diálogo “Inscrever-se” e “Minhas inscrições” em linha no Portal do Cidadão. Verificar confirmação na tela, retenção dos campos nos erros, cancelamento pela lista, permanência de inscrições em andamento com cancelamento desabilitado e atualização das vagas após as operações.
- [x] 3.3 Adicionar o botão do painel, o destino no menu do Gestor e as páginas administrativas protegidas. Verificar acesso pelos dois controles e por URL direta, formulários de cadastro e edição, filtros por data, início e fim, consulta em diálogo para eventos salvos e confirmação de remoção.

## 4. Verificação integrada

- [x] 4.1 Executar lint, build e testes de integração do escopo. Percorrer no navegador, em 360 px e desktop, cadastro, publicação no Portal, inscrição sem login, consulta e cancelamento, reagendamento confirmado e remoção. Conferir foco dos diálogos, proteção dos dados dos inscritos por papel e acesso aos indicadores e ao Meu Perfil do Gestor.

## Workflow follow-up

- Integrar `add-painel-gestor` e `restrict-gestor-access`, nessa ordem, à especificação principal `painel-gestor` antes de arquivar este delta.
