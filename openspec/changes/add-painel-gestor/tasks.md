# Tarefas — Painel Gestor

## 1. Login e página inicial

- [x] 1.1 Adicionar `/painel-gestor` com `ProtectedRoute` exclusivo para Gestor e configurar os destinos por papel em `authService.js`. Verificar os três destinos após login e os redirecionamentos da nova rota para sessão ausente, expirada ou de outro papel.
- [x] 1.2 Compor o Painel Gestor com o layout MUI, os componentes e a lógica operacional compartilhada. Verificar o título, os dados do dia em Fortaleza, o total de fichas igual ao do Caixa, os três atalhos operacionais e os estados de carregamento, zero, cardápio ausente e erro com atualização manual.

## 2. Navegação e credenciais

- [x] 2.1 Usar a variante Gestor de `NavbarPainel` no painel, em Meu Perfil e nas telas operacionais compartilhadas. Verificar os controles de perfil, “Início” e “Sair” no navegador, com a navegação interna mantendo a sessão e o menu acessível por teclado.
- [x] 2.2 Ligar Meu Perfil ao fluxo existente de e-mail e senha para Gestor. Com uma conta descartável, verificar o papel somente leitura, erros de senha atual, e-mail em uso e confirmação divergente, a persistência das alterações, a rejeição da credencial anterior e dos JWTs revogados e o novo login no Painel Gestor. Reutilizar `PerfilApiIntegrationTests` para o contrato da API.

## 3. Conta demonstrativa local

- [x] 3.1 Reutilizar o bootstrap local para criar a conta fictícia no banco de desenvolvimento com senha temporária de ambiente. Verificar o papel e o login após retirar as variáveis e reiniciar o backend. Entregar o e-mail e a senha inicial ao solicitante fora do repositório.
- [x] 3.2 Verificar em ambiente isolado que um reinício após a troca das credenciais preserva o novo acesso e rejeita o par inicial. Conferir o comportamento de inicialização sem provisionamento usando `DataInitializerTest` e a restrição ao perfil Spring `local`.

## 4. Verificação integrada

- [x] 4.1 Executar o lint e o build do frontend e verificar o percurso `/login` → `/painel-gestor` → `/meuPerfil` → “Início” em 360 px e desktop. Conferir foco visível, ausência de rolagem horizontal e os títulos, a navegação e as ações dos painéis de Nutricionista e Caixa.
