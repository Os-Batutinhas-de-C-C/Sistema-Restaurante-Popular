# Proposta — Painel Gestor

## Why

O login já identifica o papel Gestor, mas hoje abre o Painel Nutricionista. Uma página inicial própria identifica a área de trabalho do Gestor e facilita o acesso aos dados operacionais e à edição das próprias credenciais.

## What Changes

- Adicionar o Painel Gestor em `/painel-gestor`, com o padrão visual dos painéis administrativos e carregamento dos dados operacionais já disponíveis.
- Direcionar o Gestor ao novo painel pelo login existente. A nova rota é exclusiva desse papel.
- Oferecer acesso a Meu Perfil pelo cabeçalho do Painel Gestor. Na tela de perfil e nas telas operacionais compartilhadas, a navegação do Gestor liga de volta ao painel.
- Provisionar uma conta demonstrativa no ambiente local, com e-mail fictício e senha inicial temporária. A pessoa pode alterar o e-mail de login e a senha no Meu Perfil.

## Capabilities

### New Capabilities

- `painel-gestor` — Página inicial do Gestor, navegação autenticada e primeiro acesso por uma conta demonstrativa local com edição das próprias credenciais.

### Modified Capabilities

## Impact

- Frontend Next.js — página inicial, redirecionamento por papel, composição dos painéis, navegação compartilhada e Meu Perfil.
- Backend Spring Boot — reutilização dos contratos de autenticação, perfil e dados operacionais, da matriz de permissões e do bootstrap local de contas.
- Ambiente de desenvolvimento — provisionamento da conta demonstrativa no banco local indicado pela configuração existente.
