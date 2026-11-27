# Proposal

## Why

O gerador busca sugestões em refeições completas já presentes no histórico, mas o ambiente local pode não ter nenhuma composição elegível. Incluir cinco exemplos locais permite experimentar a geração desde a primeira inicialização.

## What Changes

- Preparar cinco composições completas e diferentes para o histórico do perfil `local`, suficientes para o gerador sugerir cardápios distintos.
- Garantir que os dados de exemplo não sejam carregados em outros perfis e que inicializações repetidas não dupliquem os registros.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma. Esta mudança adiciona dados locais de demonstração; não altera o comportamento funcional especificado do gerador.

## Impact

- `backend/src/main/java/com/batutinhas/restaurante_pop/config/DataInitializer.java` e os repositórios/modelos de semana e refeição.
- Banco de dados usado pelo perfil Spring `local`; nenhum endpoint ou dependência nova.
