# Design — Painel Gestor

## Context

O Spring já mapeia o tipo `G` para a autoridade `GESTOR` e retorna o perfil `Gestor` no login por e-mail e senha. O frontend agrupa Gestor e Nutricionista no destino de login e na navegação de Meu Perfil. O bootstrap `local` já pode criar usuários do tipo `G` com senha armazenada como hash BCrypt.

A mudança atualiza o destino inicial e a apresentação do Gestor descritos na [spec de integração](../../../frontend/specs/008-integracao-frontend-backend/requirements.md), em especial RF008 e RN13 para Meu Perfil. A [spec histórica de login](../../../frontend/specs/007-login/requirements.md) descreve um mock por nome de usuário. A integração vigente estabelece o login por e-mail e senha usado nesta mudança.

## Goals / Non-Goals

Dar ao Gestor uma rota inicial própria com os componentes e serviços operacionais compartilhados. Aplicar o [contrato vigente da API](../../../backend/specs/DTOs/requirements.md) às operações do painel, ao acesso à própria conta e à sessão.

## Decisions

### Destino inicial e autorização

`authService.js` seleciona o destino a partir do papel retornado pela API. A rota `app/painel-gestor/page.js` usa `ProtectedRoute` com `allowedProfiles={["Gestor"]}` e monta seu conteúdo operacional somente após o guard liberar o acesso. A sessão JWT continua em memória e a navegação interna usa o roteador do Next.js. O Spring valida cada chamada usando a autoridade vigente. O acesso por links legados ao painel e às ferramentas de Nutricionista segue os guards atuais.

### Composição do painel

Reutilizar a estrutura operativa do dashboard da Nutricionista, configurando a apresentação do Gestor com o título “Painel Gestor” e uma composição própria em `components/PainelGestor/`. Compartilhar a carga de cardápio e desperdício do dia, o hook `useFichasDia`, o indicador de fichas e os componentes de ações rápidas e de cardápio. Os painéis usam os mesmos dados e ações, de modo que uma alteração no cálculo ou na atualização do indicador se aplique a ambos.

O cabeçalho, os cartões e a adaptação para mobile usam os padrões MUI e os estilos dos painéis atuais. As referências de [desktop](<../../../frontend/docs/interface/001-cardapio/PAINEL NUTRICIONISTA - CARDAPIO.png>) e [mobile](<../../../frontend/docs/interface/001-cardapio/PAINEL NUTRICIONISTA - CARDAPIO mobile.png>) registram a barra, as cores e a organização dos cartões. Os componentes existentes apresentam carregamento, ausência de cardápio e erro com atualização manual. O registro de fichas continua associado à operação exclusiva de Caixa.

### Navegação e perfil próprio

`NavbarPainel` oferece a variante Gestor, selecionada também nas páginas operacionais compartilhadas quando a sessão identifica esse papel. O cabeçalho usa o título “Painel Gestor” e o avatar acessível “Meu Perfil”. O menu liga “Início” a `/painel-gestor` e mantém os destinos operacionais disponíveis para Gestor. Em `/meuPerfil`, o papel da conta seleciona a mesma variante durante o carregamento e após a consulta.

Os formulários e `perfilService.js` usam `GET` e `PUT /api/usuarios/me` e `PUT /api/usuarios/me/senha`. O backend resolve a conta pelo JWT e valida a senha atual para trocar e-mail ou senha. O novo e-mail precisa estar disponível, e a nova senha segue a validação de comprimento e confirmação existente. Alterar apenas o nome conserva a sessão. Alterar e-mail ou senha invalida os JWTs anteriores e requer novo login, que volta ao Painel Gestor.

### Provisionamento local

Usar `DataInitializer` em uma única inicialização local, fornecendo `BOOTSTRAP_GESTOR_EMAIL` e `BOOTSTRAP_GESTOR_PASSWORD` no ambiente do processo backend. Usar como primeira opção o endereço fictício `gestor.demo@example.test` e gerar a senha inicial no provisionamento. Se o endereço estiver ocupado, escolher outro endereço fictício disponível. A conta é persistida no banco local com o papel Gestor. Entregar o par inicial ao solicitante fora do repositório depois de verificar o login.

## Risks / Trade-offs

- O bootstrap busca contas pelo e-mail. Depois que o Gestor muda o e-mail de login, manter o par inicial configurado em um reinício pode criar uma segunda conta. Retirar as variáveis de bootstrap após confirmar a criação e reiniciar o backend com a configuração normal antes de entregar a conta.
- Links de navegação que recarregam o documento perdem a sessão em memória. Usar navegação do Next.js entre o painel, Meu Perfil e as páginas operacionais.
- Testar a troca de credenciais na conta que será entregue consumiria o par inicial. Usar uma conta descartável em banco isolado nos cenários de edição e verificar a conta de entrega com um login seguido de logout.

## Migration Plan

Publicar o frontend com a rota e navegação novas sobre o esquema de perfil vigente. No ambiente local, provisionar a conta com a configuração temporária e iniciar novamente o backend com a configuração normal. O frontend anterior pode ser restaurado e usa o comportamento de login da versão anterior com a mesma conta persistida.
