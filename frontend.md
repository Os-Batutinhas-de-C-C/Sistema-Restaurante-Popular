# Frontend — configuração e execução

O frontend apresenta o cardápio público e os painéis usados por clientes, caixa, nutricionistas e gestores. Ele fica em `frontend/` e usa Next.js com App Router.

## Stack atual

- Next.js 16.3.3, React 19.2.8 e JavaScript.
- Material UI 9, Emotion, Material Icons, Lucide, DayPicker e MUI X Charts.
- Node.js 24.15.0 e npm 11.12.1 foram usados na execução local deste projeto.

## Instalar e executar

No Windows PowerShell, a partir da raiz do repositório:

```powershell
Set-Location .\frontend
npm.cmd ci
$env:BACKEND_API_BASE_URL = "http://localhost:8080"
npm.cmd run dev
```

`npm.cmd ci` instala as dependências fixadas em `package-lock.json`; execute novamente após mudanças nesse arquivo. `BACKEND_API_BASE_URL` também pode ficar no arquivo local ignorado `.env.local`; há um exemplo em `.env.example`.

No Linux ou macOS:

```bash
cd frontend
npm ci
export BACKEND_API_BASE_URL='http://localhost:8080'
npm run dev
```

O servidor fica em primeiro plano. Aguarde `Ready` no terminal e acesse:

- `http://localhost:3000/` — redireciona para `/mainPage`.
- `http://localhost:3000/mainPage` — cardápio e área pública.
- `http://localhost:3000/login` — entrada para os painéis.

Para encerrar, pressione `Ctrl+C` no terminal do frontend. No Windows, use `npm.cmd` se a política do PowerShell bloquear `npm.ps1`.

Na verificação local de 16/11/2026, `npm.cmd run dev` iniciou o Next.js com Turbopack e `GET /mainPage` respondeu HTTP 200. Essa checagem confirma a compilação da rota pública; não substitui a verificação de conexão com o backend e o banco.

## Inicialização compatível com Windows

O script `npm run dev` executa `scripts/dev.mjs`. O launcher remove `NEXT_PRIVATE_DEV_DIR` do processo filho e chama o Next.js local com `dev . --turbopack`; ele não depende do comando Unix `env -u`. O `babel.config.js` usa o preset `next/babel`, que mantém a transformação de código compatível com o Next.js atual e o Turbopack.

O Next.js encaminha `/api/:path*` para `BACKEND_API_BASE_URL`. Esse valor deve ser uma origem, por exemplo `http://localhost:8080`, sem caminho, credenciais ou barra final. Em desenvolvimento, a configuração também usa `http://localhost:8080` como padrão; para produção, configure a variável explicitamente. Não use uma variável `NEXT_PUBLIC_*` para essa configuração do servidor.

As chamadas do frontend usam a mesma origem (`/api`); `src/proxy.js` valida a origem das solicitações antes do encaminhamento. Para dados e operações reais, inicie também o backend e prepare o PostgreSQL conforme [backend.md](./backend.md). Um servidor frontend pronto, por si só, não confirma a conexão com o banco.

## Rotas implementadas

| Rota | Área |
| --- | --- |
| `/` | Redireciona para o cardápio público. |
| `/mainPage` | Página pública com cardápio, avisos e informações do restaurante. |
| `/painelCliente` | Área do cliente, incluindo envio de mensagem pública. |
| `/login` | Autenticação. |
| `/painel-caixa` | Operações do caixa e fichas do dia. |
| `/painel-nutricionista` | Painel de acompanhamento nutricional. |
| `/painel-nutricionista-cardapio` | Consulta e gestão de cardápios. |
| `/painel-nutricionista-cardapio/gerenciar/[data]` | Gestão do cardápio de uma semana. |
| `/painel-nutricionista-estoque` | Gestão de estoque. |
| `/painel-nutricionista-mensagens` | Gestão de mensagens. |
| `/painel-nutricionista-noticias` | Gestão de notícias. |
| `/meuPerfil` | Consulta e atualização do perfil autenticado. |

Os painéis usam proteção de rota no frontend; a autorização efetiva também é aplicada pela API. Não há credenciais padrão no repositório. As contas locais opcionais são configuradas pelo backend no perfil `local`.

## Organização do código

- `src/app/`: rotas do App Router.
- `src/components/`: componentes de tela e componentes reutilizáveis.
- `src/services/`: chamadas para a API, autenticação e serviços de tela.
- `src/utils/`: funções auxiliares puras.
- `src/proxy.js`: validação das solicitações para `/api`.
- `scripts/dev.mjs`: launcher multiplataforma do servidor de desenvolvimento.

## Comandos de qualidade

Execute da pasta `frontend/`:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run test:report
npm.cmd run test:system
```

No Linux/macOS, use `npm` no lugar de `npm.cmd`. Os testes sistêmicos precisam do frontend e backend em execução, Chrome/ChromeDriver e de uma conta local de nutricionista com o e-mail usado pelo cenário (`nutri@local.test`). Defina `TEST_PASSWORD` com a senha correspondente à conta. Os relatórios são gravados em `test-reports/` e não são versionados.

