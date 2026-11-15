# Design — Testes unitários do backend

## Escopo

Implementar os RF001–RF012 de `backend/specs/unit-tests/requirements.md` em `backend/src/test`, com os documentos de especificação em `backend/specs/unit-tests`.

**Aditivo de correções — 08/11/2026:** o solicitante autorizou corrigir no backend os quatro comportamentos diagnosticados pelos testes, executar novamente a suíte e iniciar a aplicação para verificar os fluxos completos. Este aditivo substitui a restrição anterior de preservar integralmente o código de produção. Não alterar o frontend, dependências, configuração persistida ou schema.

## Organização e leitura dos testes

- Espelhar os pacotes de produção em `src/test/java/com/batutinhas/restaurante_pop/`.
- Usar classes `*Test`, `@DisplayName` em português e métodos que descrevam condição e resultado esperado.
- Registrar na documentação de cada classe o RF atendido e o motivo da proteção.
- Preparar dados, chamar uma operação e conferir o resultado; separar comportamentos independentes em métodos curtos.
- Reaproveitar factories existentes, sem compartilhar entidades mutáveis entre testes.
- Parametrizar fronteiras de texto, números e papéis; manter cada linha de dados compreensível.

## Isolamento

Services/controllers são instanciados diretamente com colaboradores Mockito. Entidades e DTOs são reais. Não carregar contexto Spring nem abrir banco, servidor ou conexão de rede.

Relógios injetáveis usam `Clock.fixed`. Chamadas estáticas de data/hora são controladas em escopos fechados com Mockito quando necessário. A validade JWT é conferida pela diferença entre emissão e expiração; nenhum teste depende de pausas ou do dia real.

O `EntityManager` de `FichasTransacaoService` é injetado somente no teste. A verificação de chamadas ao repository não é apresentada como evidência de transação, bloqueio ou rollback real.

## Decisões do solicitante

As perguntas foram respondidas antes de implementar os casos disputados:

- Atualizar notícia pela rota de mensagens deve ser rejeitado com `404`; o service deve retornar vazio sem modificar a notícia.
- Ingredientes definem refeições duplicadas, independentemente das calorias.
- Data e horário da mensagem pública devem representar um instante consistente, inclusive na virada do dia.
- E-mails de bootstrap devem receber trim antes da consulta de existência.
- Manter os testes ativos e corrigir os comportamentos de produção conforme o aditivo; não desabilitar regressões para obter uma suíte verde.

As demais validações seguem o contrato vigente, incluindo campos opcionais de estoque/refeição e a diferença entre senha no cadastro e na troca. Herança/proxies, SQL e bloqueios reais permanecem no escopo de integração.

## Correções de produção

- `MensagemService.update` aplica o mesmo filtro de tipo usado na consulta/exclusão antes de validar ou alterar dados. ID de notícia retorna vazio, traduzido pelo controller em `404`.
- `MensagemService.createPublic` captura um único `LocalDateTime` em Fortaleza e dele deriva data e horário sem nanos. O teste controla `Clock.system` para reproduzir a virada sem exigir uma implementação baseada em duas leituras.
- `Refeicao.equals/hashCode` consideram os oito campos de ingredientes; calorias e ID não distinguem composições. As verificações existentes de duplicidade em `Semana` e `SemanaService` passam a usar essa regra sem alteração do schema.
- `DataInitializer` normaliza o e-mail com trim uma vez e reutiliza o valor na busca e na criação da conta.

## Verificação dos fluxos completos

Adicionar regressões HTTP para impedir atualização de notícia pelas rotas de mensagem e rejeitar cardápios duplicados na criação/atualização sem persistência parcial. Executar a suíte com H2 explícito; iniciar também o backend fora do contexto JUnit, usando apenas dados fictícios em outro H2 em memória e contas dos três papéis. Verificar respostas públicas/protegidas, CRUDs, cardápio, fichas e revogação de sessão. Encerrar a instância de verificação ao concluir.

## Verificação

Executar primeiro as classes unitárias `*Test`, depois os testes de integração existentes. O Wrapper será tentado; se não iniciar por problema já existente, registrar a limitação e usar o Maven/JDK instalados sem alterar o Wrapper.

Registrar resultados e limitações em `tasks.md` nesta pasta. Resultados não comprovados por execução não serão marcados como concluídos.
