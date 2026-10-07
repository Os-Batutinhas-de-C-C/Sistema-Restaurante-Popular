# 🌟 Ambiente produtivo para desenvolvimento web React | JavaScript | Node.js

O foco deste conteúdo é no ambiente usado, no Terminal e configurações do VSCode para desenvolvimento com JavaScript. Vamos trabalhar nos pilares:

- Ambiente estruturado
- Terminal bem configurado
- Visual Studio Code com extensões

Siga os passos abaixo para criar um ambiente de desenvolvimento ideal. Aproveite para customizar suas próprias preferências. Nesta configuração vamos utilizar:

- CodeSpace: como ambiente de desenvolvimento
- VSCode: como editor de código
- Dev Container: para configurar o container docker no CodeSpace
- Docker: ferramenta de contenerização

## Passo 0 - Criar um app React com Next.js

Vamos criar o app antes de outras configurações para não ter conflito entre arquivos e pastas. A criação de um app é bem simples. Execute o comando abaixo:

```bash
npx create-next-app .
```

Não esqueça do ponto no final. Ele indica que vamos criar na pasta que você está agora no terminal. Sem ele será criada uma hierarquia a mais nas estruturas de pastas.

Você verá as seguintes opções:

```bash
Would you like to use TypeScript? No # Vamos focar em JS, mas você pode usar TS e prosseguir fazendo alguns ajustes no código e ferramentas.
Would you like to use ESLint? No # Vamos instalar o SonaLint, mas pode igualmente fazer a instalação do ESLint. Verifique as configurações ideais para não sobrepô-las.
Would you like to use Tailwind CSS? No # O foco da disciplina será no uso do MUI.
Would you like your code inside a `src/` directory? Yes
Would you like to use App Router? (recommended) Yes
Would you like to use Turbopack for `next dev`?  Yes
Would you like to customize the import alias (`@/*` by default)? No
```

Após confirmar as opções, o framework Next.js criou um app JavaScript ou TypeScript que usa a biblioteca React.

Para rodar o servidor de desenvolvimento execute:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) com seu browser para ver o resultado.

Você pode iniciar editando a página `app/page.js`. Perceba que a página atualiza automaticamente (Fast Refresh) e permite que você já veja o resultado das alterações na tela. Teste!

## Passo 1 - Criar CodeSpace

No Github, no seu repositório criado, abra com Codespace. Navegue no VSCode para se familiarizar com suas funcionalidades e ambiente.

## Passo 2 - Adicionar Dev Container ao CodeSpace

No CodeSpace, pressione "Ctrl+Shift+P" para exibir a "Paleta de Comandos" e comece a digitar "Dev Containers: Add Dev Container Configuration Files". Sega as instruções para criar uma nova configuração.

- Selecione para opção "Node.js".

As sugestões de features são:

- Common Utilities (que vamos usar para instalar o terminal Zsh)
- Zsh Plugins (para instalar plugins do OhMyZsh, como o zsh-autosu)
- GitHub CLI: para lidar com fluos do GitHub

Ao finalizar o processo você passa a ver dois novos arquivos: devcontainer.json e Dockerfile. No CodeSpace, pressione "Ctrl+Shift+P" para exibir a "Paleta de Comandos" e comece a digitar "codespaces: rebuild container" para ver o resultado das alterações.

## Passo 3 - Customização do container com terminal Zsh

Altere o arquivo devcontainer.json na parte de features para especificar as instalações do terminal Zsh e seu personalizador Oh My Zsh. O uso do Zsh tem algumas vanga

```json
features": {
        "ghcr.io/devcontainers/features/common-utils:2": {
            "installZsh": true, // Adiciona o Zsh ao contêiner
            "installOhMyZsh": true
        },
        "ghcr.io/devcontainers-extra/features/zsh-plugins:0": {
            "omzPlugins": "https://github.com/zsh-users/zsh-autosuggestions"
        },
```

Configure o Zsh como terminal padrão, adicionando o seguinte trecho no arquivo devcontainer.json:

```json
  // Configurar propriedades específicas da ferramenta. Mais informações: https://containers.dev/supporting.
    "customizations": {
        // Configura propriedades específicas para o VS Code.
        "vscode": {
            "settings": {
                "terminal.integrated.defaultProfile.linux": "zsh"
            }
        }
    }
```

Salve o arquivo e faça novamente o build do container digitando digitar "codespaces: rebuild container" na paleta de comandos do VSCode. Veja as alterações no terminal.

## Passo 4 - Verificar ortografia é necessário!

Vamos agora adicionar validadores de ortografia para inglês e para português. Erros de língua costumam ser distratores da leitura.

Adicione no devcontainer.json os seguintes trechos:

```json
"customizations": {
        "vscode": {
            // Adicione a extensão pelo ID
            "extensions": [
                "streetsidesoftware.code-spell-checker",
                "streetsidesoftware.code-spell-checker-portuguese-brazilian"
            ]
        }
}
```

e

```json
    "customizations": {
        "vscode": {
            "settings": {
                "cSpell.language": "en,pt,pt_BR",
                "cSpell.ignoreWords": [
                    "brazilian",
                    "devcontainers"
                ]
            }
        }
    }
```

Observe que você já possui os objetos pais: customizations, vscode e settings, logo o que deve ser adicionado é só a propriedade interna. No trecho acima adicionamos duas palavras no nosso dicionário interno para não serem reconhecidas com erro de escrita. Você pode adicionar mais.

Novamente faça o build do seu container e veja o resultado. Veja também as extensões instaladas (Ctrl+Shift+X).

## Passo 5 - Configurando git, docker e ferramentas

Vamos começar adicionando um arquivo [.gitignore](https://git-scm.com/docs/gitignore), que possui nele pastas e arquivos que não precisam ser versionados no git, nem precisam subir para o repositório no GitHub.

Copie o [arquivo modelo](https://github.com/facebook/react/blob/main/.gitignore), feito pelo Facebook, e adicione na raiz do projeto.

Agora vamos adicionar algumas features e plugins. Adicione no devcontainer.json os seguintes trechos:

```json
"customizations": {
        "vscode": {
            // Adicione a extensão pelo ID
        "extensions": [
            "ms-azuretools.vscode-docker", // Visualização de containers, imagens, volumes e integração com Docker Compose.
            "ms-vscode-remote.remote-containers", // Abre o projeto em um ambiente isolado, com todas as dependências já instaladas. https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers
            "mhutchie.git-graph", // Exibe o histórico de commits do Git em um gráfico visual e interativo.
            "eamodio.gitlens", // Melhora o suporte ao Git no VS Code com anotações, histórico de linha, comparações e mais.
            "github.vscode-github-actions" // Suporte a workflows do GitHub Actions.
        ]
        }
}
```

e

```json
features": {
        "ghcr.io/devcontainers/features/github-cli:1": {}, // Instala o GitHub CLI (gh), permitindo interações com o GitHub via terminal (ex: criar PRs, issues, clonar repositórios, gerenciar workflows).
}
```

## Passo 6 - Configurar organização do código

Vamos adicionar agora ferramentas de análise de código: o [SonarLint](https://www.sonarsource.com/products/sonarlint/), para validação de erros e problemas de segurança, e o [Prettier](https://prettier.io/), para padronização da formatação do código. Outra ferramenta bastante utilizada é o [ESlint](https://eslint.org/), voltada para análise estática de código js/ts. Como sua configuração envolve mais arquivos e regras personalizadas, sugiro consultar tutoriais específicos de instalação caso tenha interesse em utilizá-lo. Há uma sutil diferença entre essas três ferramentas:

- _Prettier_ foca exclusivamente na **formatação** automática (espaçamento, quebras de linha, aspas, etc.).
- _ESLint_ trata de **estilo** e boas práticas de código, podendo incluir ou não regras de formatação.
- _SonarLint_ vai além, com foco em **qualidade de código**, detectando bugs, vulnerabilidades, code smells e outras más práticas de desenvolvimento.

Adicione os trechos abaixo e suas configurações em settings. As configurações formatOnSave e wordWrap são do próprio VSCode, servem respectivamente para realizar a formatação ao salvar um arquivo e para pular linha, evitando a rolagem horizontal no código.

```json
"customizations": {
        "vscode": {
            "extensions": [
                "esbenp.prettier-vscode",
            ],

            "settings": {
                "editor.formatOnSave": true, // é opcional, pois pode alterar arquivos já publicados.
                "editor.wordWrap": "on", //melhor configuração s2
                "editor.defaultFormatter": "esbenp.prettier-vscode",
                "prettier.tabWidth": 4, //hora de acabar com essa briga, sempre soubemos que tab = 4 spaces
            }
        }
}
```

Vamos adicionar agora uma feature para o SonarLint. Para isto, adicione a feature no devcontainer.json:

```json
features": {
    "ghcr.io/gvatsal60/dev-container-features/sonarlint:1": {},
}
```

Novamente faça o build do seu container e veja o resultado. Veja também as extensões instaladas (Ctrl+Shift+X). Faça um pequeno exemplo de código javascript com pequenos erros para testar as novas funcionalidades.

# 📋 Conceitos

## 🐳 Docker

Docker é uma plataforma que permite empacotar, distribuir e executar aplicações em ambientes isolados chamados de _containers_. Um container é uma unidade leve, portátil e consistente, que inclui tudo o que a aplicação precisa para funcionar — bibliotecas, dependências, código e configuração — garantindo que ela funcione da mesma forma em qualquer ambiente, seja na máquina local, em um servidor ou na nuvem.

Diferente da virtualização de máquinas, em que os recursos eram mais rígidos e há uma dependência do sistema operacional, a solução do Docker é leve e fácil de implantar. Os arquivos de imagens de container são semelhantes aos pacotes de instalação de software. No entanto, eles só precisam de um runtime de container e um kernel compatível para executar a aplicação, não importando o sistema operacional usado para criar o container nem a origem das bibliotecas dentro dele.

## Dev Container

Dev Containers são ambientes de desenvolvimento prontos e reprodutíveis configurados com base em arquivos como `.devcontainer/devcontainer.json`. Eles são usados em conjunto com o VS Code (ou GitHub Codespaces) para garantir que todos os desenvolvedores de um projeto usem a mesma versão de configurações, ferramentas, extensões e dependências.

**Benefícios:**

- Reduz problemas de "na minha máquina funciona".
- Permite configuração padronizada do ambiente com Node, TypeScript, linters, etc.
- Integração nativa com o VS Code e GitHub CodeSpaces.

## JSON

JSON (**JavaScript** Object Notation) é um formato leve de troca de dados, fácil de ler e escrever. É usado extensivamente para configurar ambientes (como no `devcontainer.json`), transferir dados entre front-end e back-end, e configurar serviços em nuvem.

#### 🧩 Elementos básicos do JSON

JSON (JavaScript Object Notation) é composto por **pares chave-valor** e pode conter diferentes tipos de dados. Seus dois principais blocos estruturais são **objetos** e **arrays**, além dos valores literais.

**🔹 Objeto (`Object`)**

Um **objeto** é uma estrutura de dados composta por pares `chave: valor`, delimitados por `{}`. Cada chave deve ser uma **string** entre aspas duplas, e os valores podem ser de qualquer tipo JSON válido. Veja o exemplo abaixo:

```json
{
    "nome": "Lana",
    "idade": 30,
    "ativo": true
}
```

**🔹 Array (Array)**

Um array é uma lista ordenada de valores, delimitada por [ ]. Os elementos podem ser de tipos diferentes, inclusive outros objetos ou arrays. Veja o exemplo abaixo:

```json
["JavaScript", "TypeScript", "Python"]
```

Um exemplo com uma lista de objetos:

```json
[
    { "nome": "João", "idade": 25 },
    { "nome": "Maria", "idade": 28 }
]
```

## 💻 Zsh (Z Shell)

Zsh é um interpretador de comandos (shell) para sistemas Unix/Linux, compatível com o Bash, mas com **funcionalidades mais avançadas**, como:

- **Autocompletar inteligente** com sugestões e correções automáticas.
- **Suporte a plugins e temas** via frameworks como [Oh My Zsh](https://ohmyz.sh/).
- **Histórico compartilhado entre abas/terminais**.
- **Prompt personalizável** com informações de Git, status de comando anterior, entre outros.

Zsh é especialmente útil para desenvolvedores, pois acelera a produtividade no terminal com recursos como:

```bash
# Autocompleta comandos e nomes de arquivos
cd D<tab>   # completa para 'Documents' ou diretório equivalente

# Sugestão de comandos do histórico
git status     # ao digitar `git`, ele sugere o uso anterior
```

## ✨ [oh my zsh](https://ohmyz.sh/)

Oh My Zsh é uma estrutura open source para personalizar o shell Zsh, amplamente usada em Linux e macOS. Zsh é um shell projetado para uso interativo, semelhante ao Bash, usado em sistemas Unix/Linux e macOS.

Com WSL, pode ser instalado no Ubuntu do Windows Terminal. Oferece temas, plugins e atalhos para melhorar a produtividade e a aparência do terminal. Fácil de instalar, é popular entre desenvolvedores por sua flexibilidade e vasta comunidade. Suas funcionalidades são:

- Autocompletar e correção de comandos
- Temas e cores
- Gerência avançada do histórico de comandos
- Variedade enorme de plugins, comunidade ativa.

### 🔌 Plugins e complementos:

Coleção de complementos adicionais ao ohmyzsh: O [zsh-completions](https://github.com/zsh-users/zsh-completions) é uma coleção de complementos adicionais para o Zsh (Z Shell), projetada para melhorar a experiência de autocompletar comandos e opções no terminal.

[Fast Syntax Highlighting](https://github.com/zdharma/fast-syntax-highlighting) é um plugin para o shell Zsh que fornece realce de sintaxe (syntax highlighting) em tempo real para comandos digitados no terminal. Ele ajuda os usuários a identificar erros, comandos válidos e argumentos enquanto escrevem.

## 📝 Spell-checker

O _spell-checker_ é um verificador ortográfico que ajuda a identificar erros de escrita em códigos e comentários. No VS Code, use o plugin **Code Spell Checker**, disponível na extensão `streetsidesoftware.code-spell-checker`, com suporte a múltiplos idiomas como inglês e português (pt-BR). É necessário instalar tanto o plugin quanto o dicionário da língua.

## 🐙 GitHub CLI (gh)

Use o GitHub CLI para interagir com repositórios remotos:

```bash
gh auth login                   # Faz login na sua conta do GitHub
gh repo create                  # Cria um novo repositório no GitHub
gh repo clone usuario/repositorio # Clona um repositório
gh pr create                    # Cria um pull request
gh issue list                   # Lista issues do repositório
```

## ⚙️ Node.js

O **Node.js** é um ambiente de execução de JavaScript multiplataforma, de código-aberto e gratuita, baseado no motor V8 do Chrome. Ele permite executar código JavaScript no servidor, fora do navegador.

Criado com foco em desempenho e escalabilidade, o Node.js é especialmente útil para aplicações web em tempo real, APIs RESTful e serviços que exigem alta taxa de I/O (entrada e saída), como chats e sistemas de streaming.

### 🚀 Principais características

- **Event-driven** e **non-blocking**: usa um modelo assíncrono baseado em eventos, o que o torna altamente eficiente.
- **Leve e rápido**: ideal para aplicações escaláveis.
- **NPM**: possui o maior ecossistema de bibliotecas open source do mundo.
- **Cross-platform**: funciona em Windows, Linux e macOS.

### ▶️ Principais comandos

**Executar um arquivo JavaScript**

```bash
node arquivo.js
```

Executa um script Node.js diretamente no terminal.

**Inicializar um projeto Node**

```bash
npm init
npm init -y   # pula perguntas e cria um package.json com padrão
```

Cria o package.json, que organiza as dependências e scripts do projeto.

## 📦 NPM (Node Package Manager)

O **NPM** é o gerenciador de pacotes oficial do Node.js. Ele permite instalar bibliotecas, frameworks e ferramentas de forma simples, além de gerenciar scripts e dependências de um projeto JavaScript ou TypeScript.

### 🧰 Comandos essenciais

```bash
npm init -y                   # Cria um package.json com configurações padrão
npm install <pacote>          # Instala um pacote como dependência
npm install --save-dev <pacote>  # Instala como dependência de desenvolvimento
npm run <script>              # Executa um script definido no package.json
npm outdated                  # Verifica pacotes desatualizados
npm update                    # Atualiza pacotes
```

### 📁 Estrutura após instalação

- package.json: define as dependências e scripts do projeto.
- package-lock.json: registra a árvore de dependências exata.
- node_modules/: pasta onde os pacotes instalados ficam armazenados. Essa pasta não precisa ser versionada ou estar no repositório online. Além de possuir um tamanho enorme, com o package.json é possível reconstruí-la em qualquer máquina.

### 💡 Dica

Use scripts personalizados no package.json para tarefas recorrentes, como:

```json
"scripts": {
  "dev": "node index.js",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

### ⚡ npx: executar sem instalar

O comando npx permite executar um pacote diretamente do repositório NPM, sem precisar instalá-lo globalmente. Exemplo: `npx eslint . `.

## 🎨 Prettier

O Prettier é um formatador de código automático. Ele garante consistência no estilo de escrita, padronizando indentação, aspas, ponto e vírgula e outros detalhes.

## 🧪 SonarLint

O SonarLint detecta bugs, vulnerabilidades e code smells diretamente no editor. Com o arquivo aberto, o SonarLint analisa o código automaticamente e destaca problemas com sugestões de correção. É possível integrar com o [SonarQube](https://www.sonarsource.com/open-source-editions/sonarqube-community-edition/) para regras centralizadas. Com SonarQube é possível definir limites, por exemplo, da cobertura de testes unitários no código.

## ⚛️ React

O **React** é uma biblioteca JavaScript para construção de interfaces de usuário, mantida pelo Meta (Facebook). Ele é baseado em componentes reutilizáveis e no conceito de _estado_ e _propriedades_.

### 🤔 Por que o React é uma biblioteca e não um framework?

O **React** é classificado como **biblioteca** porque ele **foca exclusivamente na camada de visualização (View)** da aplicação. Ele resolve o problema de criar interfaces de usuário reativas, mas **não impõe uma estrutura completa ou regras rígidas sobre como organizar seu projeto**.

#### Características de biblioteca:

- Você **escolhe** como lidar com rotas, requisições HTTP, gerenciamento de estado, etc.
- Ele é **flexível e modular**, podendo ser combinado com outras bibliotecas como Redux, React Router, Axios, entre outras.
- **Você controla o fluxo da aplicação** — ou seja, o React é chamado por você, não o contrário.

#### Já um framework...

...como **Next.js**, **Angular** ou **Vue com Nuxt**, tende a:

- Fornecer uma **estrutura completa** com roteamento, compilação, autenticação, etc.
- **Controlar o fluxo da aplicação**, chamando o seu código em pontos específicos (inversão de controle).
- Ter uma abordagem mais **rígida**, com padrões definidos para estrutura e funcionamento.

## 🌐 Next.js

O Next.js é um framework baseado em React para desenvolvimento web moderno. Ele oferece funcionalidades como renderização do lado do servidor (SSR), Geração Estática (SSG), rotas automáticas, suporte a API Routes e muito mais. O comando [`npx create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). inicializa um projeto com rotas baseadas em arquivos (pages/), suporte a CSS/SCSS, imagens otimizadas e estrutura para API backend.

...como **Next.js**, **Angular** ou **Vue com Nuxt**, tende a:

- Fornecer uma **estrutura completa** com roteamento, compilação, autenticação, etc.
- **Controlar o fluxo da aplicação**, chamando o seu código em pontos específicos (inversão de controle).
- Ter uma abordagem mais **opinionada**, com padrões definidos para estrutura e funcionamento.

This is a [Next.js](https://nextjs.org) project bootstrapped with

Para aprender mais sobre Next.js, veja:

- [Next.js Documentation](https://nextjs.org/docs) - funcionalidades Next.js e API.
- [Learn Next.js](https://nextjs.org/learn) - um tutorial interativo Next.js.

## ⚙️ Power Toys

[PowerToys](https://apps.microsoft.com/detail/xp89dcgq3k6vld?hl=en-US&gl=BR) é um conjunto de ferramentas gratuitas da Microsoft projetadas para melhorar a produtividade e personalização no Windows. Alguns recursos do Power Toys são:

Algumas ferramentas do PowerToys:

- Seletor de Cores: Um seletor de cores universal que exibe os valores RGB e HEX de qualquer ponto da tela. `win + Shift + c`
- Localizar Meu Mouse: Criar um foco no mouse `Ctrl Ctrl`
- Espiada: Extensões no Explorador de Arquivos: `Ctrl + space`
- Miniaturas de arquivos: permite visualizar arquivos como svg e md no Explorador de arquivos.
- Extrator de Texto: Extrai texto de imagens ou outras fontes visuais usando OCR. `win + Shift + t`
- PowerToys Run: Um lançador rápido de aplicativos e comandos, semelhante ao Spotlight no macOS. `alt + space`
- Colar avançado: permite colocar o conteúdo da área de transferência em qualquer formato necessário. `win + Shift + v`
