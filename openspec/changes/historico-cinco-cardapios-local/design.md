# Design

## Context

`DataInitializer` já roda somente com o perfil Spring `local` e cria contas iniciais. O histórico consumido pelo gerador é formado por refeições completas vinculadas às cinco posições úteis de uma semana; a API valida a semana como segunda-feira. (Ver `proposal.md` - Why.)

## Goals / Non-Goals

**Goals:**

- Disponibilizar cinco combinações completas e diferentes na leitura do histórico local.
- Fazer a carga ser restrita ao perfil local e idempotente.

**Non-Goals:**

- Alterar a seleção de sugestões, endpoints ou dados de produção.
- Criar histórico real de refeições servidas ou preencher indicadores de desperdício e vendas.

## Decisions

- Usar o inicializador já condicionado a `@Profile("local")`, estendendo sua lógica com os repositórios necessários. Isso mantém os exemplos no mesmo fluxo já usado para dados iniciais; uma migration global os inseriria também em bancos que não usam o perfil local.
- Associar as cinco refeições completas a uma semana histórica de demonstração, uma por dia útil. Suas composições devem diferir nos campos usados pelo gerador para eliminar duplicatas; calorias podem variar como estimativa.
- Tornar a operação idempotente verificando a semana/composições demonstrativas antes de salvar. Não apagar nem substituir semanas, refeições ou dados já existentes.
- Manter os exemplos centralizados no código do inicializador para simplificar a manutenção do conjunto local, em vez de criar um arquivo SQL global.

## Risks / Trade-offs

- Uma semana com data fixa pode coincidir com um registro preexistente → detectar a semana antes de persistir e escolher uma data histórica livre, mantendo a operação repetível.
- Dados demonstrativos podem ser confundidos com cardápios servidos → usar data passada e deixar explícito no código/documentação local que são exemplos.

## Migration Plan

Não há migração de schema. Ao iniciar com o perfil `local`, salvar os exemplos apenas quando ainda não estiverem presentes; para reverter, remover manualmente somente os registros demonstrativos identificados, sem limpar as demais semanas.
