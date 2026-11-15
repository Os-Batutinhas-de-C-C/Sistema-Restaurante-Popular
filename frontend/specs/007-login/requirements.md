# Requisitos — Login de Funcionários e Recuperação de Acesso

## Objetivo

Permitir que funcionários acessem o painel administrativo com nome de usuário e senha, e iniciem a recuperação de acesso por e-mail, bloqueando páginas administrativas para quem não está logado.

## Histórias de usuário

### RF002 — Login e recuperação de senha
Como funcionário (nutricionista ou caixa),
quero fazer login com minhas credenciais,
para que o sistema libere acesso apenas às ferramentas pertinentes ao meu nível de permissão, e poder recuperar a senha pela tela de login informando um e-mail de recuperação previamente cadastrado.

### HU006 — Controle de acesso administrativo
Como administrador do sistema (nutricionista, caixa ou gestores),
quero fazer login com minhas credenciais,
para acessar as ferramentas do sistema de acordo com o meu nível de permissão.

## Regras de negócio

- **RN01:** Apenas funcionários fazem login. Clientes usam o Portal do Cidadão sem cadastro (ref HU004, HU007, HU008).
- **RN02:** O login é por nome de usuário e senha (não por e-mail nem matrícula).
- **RN03:** Sem backend, a autenticação consulta um mock em `src/services/authService.js` com um único usuário: usuário `admin`, senha `admin`, perfil Nutricionista. [SUPOSIÇÃO: o perfil do mock é Nutricionista, pois o redirecionamento vai para o painel da nutricionista]
- **RN04:** Após o login bem-sucedido, o usuário é redirecionado para `/painel-nutricionista` (ref HU006). A rota do painel do Caixa não está definida nesta spec.
- **RN05:** Páginas administrativas (`/painel-nutricionista` e as de Notícias e Mensagens) bloqueiam acesso de quem não está logado, redirecionando para `/login` (ref HU006).
- **RN06:** O botão "Voltar" leva à tela inicial do Portal do Cidadão (`/mainPage`).
- **RN07:** A recuperação de acesso pede o e-mail de recuperação. O e-mail é cadastrado em "Meu Perfil" (RF011). Nesta versão, "ENVIAR LINK" não envia nada (sem backend) e mostra confirmação genérica, sem informar se o e-mail existe. [SUPOSIÇÃO]
- **RN08:** Mensagens de erro de credenciais inválidas não são exibidas nesta versão (decisão de escopo). A HU006 prevê "mensagem clara de erro"; esse critério fica para uma próxima entrega.
- **RN09:** A sessão é mantida no navegador durante a navegação administrativa e removida no logout. Ao abrir `/login`, a sessão anterior é encerrada e o formulário sempre é exibido; um novo login válido é necessário para entrar novamente. [SUPOSIÇÃO]

## Critérios de aceitação

### Cenário 1 — Login com credenciais válidas
**Dado que** a pessoa está em `/login`
**Quando** informa usuário `admin` e senha `admin` e clica em "ENTRAR" (ou pressiona Enter)
**Então** é redirecionada para `/painel-nutricionista`.

### Cenário 2 — Login com credenciais inválidas
**Dado que** a pessoa informa usuário ou senha incorretos
**Quando** clica em "ENTRAR"
**Então** permanece em `/login`, sem acesso ao painel (nesta versão, sem mensagem de erro).

### Cenário 3 — Mostrar e ocultar senha
**Dado que** a senha está digitada
**Quando** a pessoa clica no ícone de olho
**Então** a senha alterna entre visível e oculta, e o `aria-label` do ícone alterna entre "Mostrar senha" e "Ocultar senha".

### Cenário 4 — Botão Voltar
**Dado que** a pessoa está em `/login`
**Quando** clica em "Voltar"
**Então** é levada à tela inicial do Portal do Cidadão.

### Cenário 5 — Abrir a recuperação de acesso
**Dado que** a pessoa clica em "RECUPERAR SENHA"
**Quando** a ação é disparada
**Então** o modal "Recuperação de Acesso" abre com o foco no campo de e-mail, sem sair da tela.

### Cenário 6 — Envio do link de recuperação
**Dado que** a pessoa informa um e-mail em formato válido no modal
**Quando** clica em "ENVIAR LINK"
**Então** o modal fecha e um Snackbar confirma o envio de forma genérica.

### Cenário 7 — E-mail vazio ou inválido
**Dado que** o campo de e-mail está vazio ou com formato inválido
**Quando** a pessoa observa o botão "ENVIAR LINK"
**Então** o botão está desabilitado.

### Cenário 8 — Cancelar a recuperação
**Dado que** o modal está aberto
**Quando** a pessoa clica em "CANCELAR", pressiona Esc ou clica fora da caixa
**Então** o modal fecha, o campo é limpo e o foco volta ao botão "RECUPERAR SENHA".

### Cenário 9 — Acesso a página administrativa sem login
**Dado que** a pessoa não está logada
**Quando** tenta abrir `/painel-nutricionista`, a tela de Notícias ou a de Mensagens
**Então** é redirecionada para `/login`.

### Cenário 10 — Abrir o login com uma sessão anterior
**Dado que** a pessoa possui uma sessão administrativa ativa
**Quando** acessa `/login`
**Então** a sessão anterior é encerrada e o formulário de login é exibido; só credenciais válidas liberam o painel. [SUPOSIÇÃO]

## Restrições
- Como não há integração com backend no momento, a autenticação deve consumir o mock em `src/services/authService.js`. As credenciais em texto puro são aceitáveis só enquanto não houver backend e não podem ir para produção.
- Deve utilizar exclusivamente componentes da biblioteca Material UI (MUI).
- Deve atender à RNF001 e à HU001: mobile-first, a partir de 360px, sem rolagem horizontal.

## Pendências com o cliente
- O RF002 cita só "nutricionista ou caixa", enquanto a HU006 inclui gestores. Confirmar os perfis que logam e para onde cada um vai (Caixa e Gestor não têm rota definida).
- A tela de redefinição de senha (a que o link do e-mail abriria) não existe no SRS. Definir se entra no escopo.
- Mensagens de erro de login (HU006) ficaram para uma próxima entrega.
- Confirmar se há limite de tentativas de login ou bloqueio; o SRS não menciona, e a spec assume que não há.
