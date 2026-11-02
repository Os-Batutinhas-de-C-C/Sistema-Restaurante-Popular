# Requisitos — Tela de Login e Autenticação

## Objetivo

Permitir que usuários credenciados (Nutricionista, Operador do Caixa e Gestores) realizem autenticação segura no sistema com e-mail e senha, redirecionando-os para os respectivos painéis administrativos conforme seu nível de permissão, além de oferecer funcionalidade para recuperação de senha.

## Histórias de usuário

- **HU006 — Controle de Acesso Administrativo:**
  Como um administrador do sistema (nutricionista, caixa ou gestores), eu posso fazer login com minhas credenciais, de modo que eu acesse as ferramentas do sistema de acordo com o meu nível de permissão.

- **RF002 — Login e Recuperação de Senha:**
  Como um funcionário (nutricionista ou caixa), eu posso fazer login com minhas credenciais, de modo que o sistema libere acesso apenas às ferramentas pertinentes ao meu nível de permissão. Posso também recuperar a senha de acesso pela tela de login informando um e-mail de recuperação previamente cadastrado.

- **RF011 — Gestão de Credenciais de Login / Perfil:**
  Como um usuário logado (caixa ou nutricionista), eu posso gerenciar minhas credenciais para garantir a manutenção e segurança da minha conta.

## Regras de negócio

- **RN01 (Autenticação por Perfil):** O sistema deve validar e-mail e senha informados. Se válidos, deve identificar a categoria do usuário (ex: `nutricionista` ou `caixa`) e redirecioná-lo para o seu painel correspondente.
- **RN02 (Mensagem de Erro Visual):** Caso as credenciais sejam inválidas ou os campos estejam em branco, o sistema deve exibir uma mensagem de erro clara sem expor detalhes sensíveis.
- **RN03 (Recuperação de Senha):** A tela deve conter um link/botão "Esqueceu a senha?". Ao ser acionado, deve abrir um modal (Dialog) solicitando o e-mail de recuperação.
- **RN04 (Bloqueio de Rotas Protegidas):** O sistema deve impedir o acesso direto a URLs administrativas caso o usuário não esteja autenticado, redirecionando-o para `/login`.
- **RN05 (Persistência e Mock):** A validação de login e o envio do e-mail de recuperação serão simulados localmente via `authService.js` até a integração com a API final.

## Critérios de aceitação

### Cenário 1 — Login bem-sucedido (Nutricionista ou Caixa)
**Dado que** o usuário insere credenciais válidas na tela de login  
**Quando** clica no botão "Entrar"  
**Então** o sistema realiza a autenticação e redireciona imediatamente para o painel correspondente.

### Cenário 2 — Tentativa de login com dados inválidos
**Dado que** o usuário preenche e-mail ou senha incorretos  
**Quando** clica em "Entrar"  
**Então** o sistema permanece na tela de login e exibe um alerta de erro em destaque.

### Cenário 3 — Solicitação de recuperação de senha
**Dado que** o usuário clica em "Esqueceu a senha?"  
**Quando** preenche um e-mail válido no modal de recuperação e clica em "Enviar"  
**Então** uma mensagem de confirmação é exibida e o modal é fechado.

## Restrições
- A tela deve ser totalmente responsiva (mobile-first, a partir de 360px).
- Os estilos visuais devem seguir rigorosamente o padrão do Material UI v6 configurado no projeto.