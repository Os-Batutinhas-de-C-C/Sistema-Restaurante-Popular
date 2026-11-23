## 🍽️ Sistema Restaurante Popular

Sistema web para consulta do cardápio, gestão de fichas, refeições e estoque do Restaurante Popular de Quixadá.

---

## 🚀 Sobre o Projeto

O **Sistema Restaurante Popular** oferece o cardápio público do Restaurante Popular de Quixadá e ferramentas operacionais para as equipes de nutrição e caixa. O projeto contém autenticação por perfil, gestão de cardápios e refeições, estoque, fichas, notícias, mensagens e atualização de perfil.

### 🎨 Design e Protótipo
O design da interface do sistema foi validado junto ao cliente. O protótipo interativo e as telas finais podem ser acessados através do Figma:
- **Link do Figma:** https://www.figma.com/design/JVRY49Zo1e1F1GAfpVD9wD/RESTAURANTE-POPULAR?node-id=0-1&t=WiMaLT7KNzggLFvq-1

### 📎Anexos do Projeto 
- **Link do drive:** https://drive.google.com/drive/folders/1iFvenMoOS3NGie6ryhtk90SZci4ebJHp?usp=sharing

### Documentação técnica

- [Frontend: configuração, rotas e comandos](./frontend.md)
- [Backend: API, banco de dados e execução](./backend.md)

---

## 🏛️ Arquitetura do Sistema

O frontend apresenta as telas, a API Spring Boot aplica as regras de negócio e o PostgreSQL persiste os dados.

### Frontend (Interface do Usuário)
- **Framework:** Next.js 16.3.3 com App Router, React 19.2.8 e JavaScript.
- **Interface:** Material UI 9, Emotion, Material Icons, Lucide, DayPicker e MUI X Charts.
- **Execução local validada:** Node.js 24.15.0 e npm 11.12.1.
- O frontend chama a API pela mesma origem (`/api`) e o Next.js encaminha as requisições ao backend.

### Backend (Regras de Negócio e API)
- **Linguagem/Framework:** Java 25 e Spring Boot 4.1.1, com Spring Web, Spring Security e Spring Data JPA.
- A API usa JWT sem sessão de servidor e aplica permissões para os perfis `NUTRICIONISTA`, `GESTOR` e `CAIXA`.

### Banco de Dados (Persistência)
- **SGBD:** PostgreSQL. H2 é usado nos testes do backend.

---

## ⚙️ Como executar backend e frontend

Os comandos abaixo usam **Windows PowerShell**. Mantenha dois terminais abertos: um para o Spring Boot e outro para o Next.js.

### Pré-requisitos

- JDK **25** instalado.
- Maven instalado e disponível no `PATH` para usar o iniciador Windows `run-with-java25.cmd`; o Maven Wrapper é uma alternativa.
- Node.js e npm instalados; esta execução foi validada com Node.js 24.15.0 e npm 11.12.1.
- PostgreSQL em execução, com acesso ao banco `restaurante_popular` e ao schema JPA atual.

Para obter o projeto:

```powershell
git clone https://github.com/Os-Batutinhas-de-C-C/Sistema-Restaurante-Popular.git
Set-Location .\Sistema-Restaurante-Popular
```

O banco local deste ambiente já foi inicializado e recebeu as migrações de integração e de perfil. As tabelas JPA atuais foram criadas sem importar as tabelas legadas; desde então, contas de desenvolvimento autorizadas foram registradas no banco local. Use `validate` nas próximas inicializações. Os scripts em `backend/database/migrations/` estão atualmente ignorados pelo Git, portanto não são incluídos em um clone novo. Para preparar outro banco, consulte [backend.md](./backend.md) e obtenha os scripts de migração mantidos pela equipe; os scripts antigos em `database/` não correspondem ao modelo JPA atual.

Os arquivos locais `backend/src/main/resources/application.properties` e `frontend/.env.local` são ignorados pelo Git e não aparecem em um clone novo. Neste computador eles já existem. Em outra instalação, configure as variáveis de conexão do PostgreSQL e `JWT_SECRET_BASE64` no terminal do backend, configure `BACKEND_API_BASE_URL` no terminal do frontend e prepare o schema conforme [backend.md](./backend.md). `ddl-auto=validate` exige que as tabelas JPA já existam; o comando de inicialização não cria nem migra o schema.

O código de Meu Perfil também exige a migração `V20261103__perfil_usuario.sql`, aplicada antes de iniciar com `validate`: ela adiciona a versão de tokens e o e-mail de login único. Neste banco local, essa migração já foi aplicada e os dados existentes foram preservados. Depois de atualizar o código, reinicie o backend e faça novo login; tokens emitidos sem a nova versão deixam de ser aceitos. Consulte [backend.md](./backend.md) para preparar outro banco.

Os comandos de inicialização abaixo são servidores em primeiro plano e **não devolvem o prompt do PowerShell enquanto estiverem funcionando**. Isso é esperado: deixe o primeiro terminal aberto, espere a mensagem de inicialização e abra um segundo terminal para iniciar o outro serviço. O backend confirma a inicialização com `Started RestaurantePopApplication`; o frontend mostra `Ready` e `http://localhost:3000`. Fechar um terminal ou pressionar `Ctrl+C` encerra aquele serviço.

### Terminal 1 — backend

Comece na raiz do repositório:

```powershell
Set-Location .\backend
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = "validate"
```

Se a conexão já estiver configurada no arquivo local ignorado `backend/src/main/resources/application.properties`, mantenha essa configuração. Caso precise defini-la pelo terminal, use:

```powershell
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/restaurante_popular"
$env:SPRING_DATASOURCE_USERNAME = Read-Host "Usuário do PostgreSQL"
$senhaBanco = Read-Host "Senha do PostgreSQL" -AsSecureString
$env:SPRING_DATASOURCE_PASSWORD = [System.Net.NetworkCredential]::new("", $senhaBanco).Password
```

O backend também exige `JWT_SECRET_BASE64`, uma chave Base64 com pelo menos 32 bytes aleatórios. Se ela ainda não estiver configurada, gere uma chave para este terminal, sem exibi-la:

```powershell
if (-not $env:JWT_SECRET_BASE64) {
    $jwtBytes = New-Object byte[] 32
    $jwtRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $jwtRng.GetBytes($jwtBytes)
        $env:JWT_SECRET_BASE64 = [Convert]::ToBase64String($jwtBytes)
    } finally {
        $jwtRng.Dispose()
        [Array]::Clear($jwtBytes, 0, $jwtBytes.Length)
    }
}
```

Essa chave fica no ambiente do terminal. Uma chave nova invalida os tokens emitidos pela anterior. Mantenha credenciais e chaves fora dos arquivos versionados.

Na instalação Windows utilizada neste ambiente, `run-with-java25.cmd` seleciona o JDK 25 em `%USERPROFILE%\jdks\temurin-25.0.5.8` e chama o Maven instalado:

```powershell
.\run-with-java25.cmd
```

Com todas as dependências já instaladas, o mesmo iniciador pode usar o Maven offline: `.\run-with-java25.cmd -o`.

Se o JDK estiver em outro caminho, configure `JAVA_HOME` e inicie pelo Maven Wrapper ou pelo Maven instalado:

```powershell
$env:JAVA_HOME = Read-Host "Caminho da instalação do JDK 25"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
java -version
.\mvnw.cmd spring-boot:run
# Alternativa com Maven instalado: mvn.cmd spring-boot:run
```

Aguarde a mensagem de inicialização do Spring Boot. A API fica em **http://localhost:8080**.

Em um banco novo, as tabelas de usuários e credenciais ficam vazias. Para criar contas de desenvolvimento, configure opcionalmente o perfil `local` e os pares de variáveis `BOOTSTRAP_NUTRICIONISTA_EMAIL`/`BOOTSTRAP_NUTRICIONISTA_PASSWORD`, `BOOTSTRAP_CAIXA_EMAIL`/`BOOTSTRAP_CAIXA_PASSWORD` ou `BOOTSTRAP_GESTOR_EMAIL`/`BOOTSTRAP_GESTOR_PASSWORD` antes de iniciar o backend, conforme [backend.md](./backend.md). Não existem credenciais padrão.

### Terminal 2 — frontend

Em outro terminal, comece novamente na raiz do repositório:

```powershell
Set-Location .\frontend
```

Instale as dependências na primeira execução ou após alterações em `package-lock.json`:

```powershell
npm.cmd ci
```

Inicie o servidor de desenvolvimento:

```powershell
$env:BACKEND_API_BASE_URL = "http://localhost:8080"
npm.cmd run dev
```

Abra **http://localhost:3000/mainPage**; o login fica em **http://localhost:3000/login**. O Next.js encaminha as chamadas `/api` ao backend pela mesma origem do frontend. `BACKEND_API_BASE_URL` pode também ficar no arquivo local ignorado `frontend/.env.local`.

O script `dev` inicia o Next.js com Turbopack por meio de um launcher Node compatível com Windows e Unix. Ele também remove `NEXT_PRIVATE_DEV_DIR` do processo do servidor; `babel.config.js` usa o preset `next/babel` para manter a configuração compatível com o Next.js atual. Consulte [frontend.md](./frontend.md) para rotas, integração e testes.

Para encerrar o sistema, pressione **Ctrl+C em cada terminal**. No Windows, use `npm.cmd` para evitar a política de execução do script `npm.ps1`.

## 🧪 Como executar os testes

Os testes do frontend ficam em `frontend/test/` e usam Jest para testes unitários,
de serviços e de componentes. Os testes sistêmicos usam Selenium WebDriver e
validam os principais fluxos da aplicação.

### Pré-requisitos dos testes

- Backend disponível em `http://localhost:8080`.
- Frontend disponível em `http://localhost:3000`.
- Dependências instaladas com `npm.cmd ci` (Windows) ou `npm ci` (Linux/macOS).
- Google Chrome e ChromeDriver disponíveis no `PATH` para os testes Selenium.
- O teste sistêmico usa a conta `nutri@local.test`; prepare-a pelo perfil local do backend e defina `TEST_PASSWORD` com a senha correspondente. O projeto não fornece contas padrão.

Execute os comandos a partir da pasta `frontend`:

```powershell
Set-Location .\frontend

# Testes Jest
npm.cmd test

# Testes Jest com cobertura e relatórios
npm.cmd run test:report

# Testes sistêmicos Selenium
npm.cmd run test:system
```

No Linux/macOS, substitua `npm.cmd` por `npm`.

### Relatórios e evidências

Os relatórios são gerados em uma pasta visível e dedicada dentro do frontend:

- **Jest — relatório visual:** [frontend/test-reports/jest/coverage/lcov-report/index.html](./frontend/test-reports/jest/coverage/lcov-report/index.html)
- **Jest — resultados JSON:** [frontend/test-reports/jest/results.json](./frontend/test-reports/jest/results.json)
- **Selenium — relatório dos cenários:** [frontend/test-reports/selenium/report.json](./frontend/test-reports/selenium/report.json)
- **Selenium — screenshots:** [frontend/test-reports/selenium/](./frontend/test-reports/selenium/)

Os arquivos são gerados localmente e ignorados pelo Git. Execute `test:report`
e `test:system` para regenerá-los após cada alteração.
