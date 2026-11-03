## 🍽️ Sistema Restaurante Popular

Sistema web de cardápio digital, gestão de fichas e estoque desenvolvido para otimizar o fluxo e paginação do cardápio do restaurante popular de Quixadá.

---

## 🚀 Sobre o Projeto

O **Sistema Restaurante Popular** permite que os clientes do restaurante acessem o cardápio de forma digital e visualize os itens disponíveis nas refeições pela interface web. O sistema conta também com um painel para a gestão de produtos, cardápio e estoque em tempo real.

### 🎨 Design e Protótipo
O design da interface do sistema foi validado junto ao cliente. O protótipo interativo e as telas finais podem ser acessados através do Figma:
- **Link do Figma:** https://www.figma.com/design/JVRY49Zo1e1F1GAfpVD9wD/RESTAURANTE-POPULAR?node-id=0-1&t=WiMaLT7KNzggLFvq-1

### 📎Anexos do Projeto 
- **Link do drive:** https://drive.google.com/drive/folders/1iFvenMoOS3NGie6ryhtk90SZci4ebJHp?usp=sharing

---

## 🏛️ Arquitetura do Sistema

O sistema foi arquitetado com uma separação clara entre as camadas de apresentação (Frontend), regras de negócio (Backend) e persistência de dados (Banco de Dados), garantindo escalabilidade e facilidade de manutenção.

### Frontend (Interface do Usuário)
- **Framework/Biblioteca:** React com Next.js. A utilização do Next.js permite uma navegação fluida e renderização otimizada, essencial para o acesso rápido dos clientes ao cardápio e para o uso dos painéis administrativos.
- **Ambiente de Execução:** Node.js. Fornece a base de execução para o ecossistema e gerenciamento de pacotes do frontend.
- **Biblioteca de UI:** Material UI (MUI). Utilizado para garantir uma interface padronizada, responsiva e acessível, fornecendo componentes prontos para botões, formulários, tabelas e modais consistentes em todo o sistema.

### Backend (Regras de Negócio e API)
- **Linguagem/Framework:** Java (Spring Boot). O Spring Boot atua como o controlador do sistema, sendo responsável por processar as requisições do frontend, validar as regras de negócio (como limites de fichas e permissões de acesso) e orquestrar a comunicação segura com o banco de dados.

### Banco de Dados (Persistência)
- **SGBD:** PostgreSQL (SQL). Banco de dados relacional robusto encarregado de armazenar com segurança todas as informações transacionais do sistema, incluindo o controle do estoque em tempo real, as fichas vendidas pelo caixa, os usuários autenticados, mensagens da ouvidoria e o histórico de cardápios.

---

## ⚙️ Como executar backend e frontend

Os comandos abaixo usam **Windows PowerShell**. Mantenha dois terminais abertos: um para o Spring Boot e outro para o Next.js.

### Pré-requisitos

- JDK **25** instalado.
- Maven instalado e disponível no `PATH` para usar o iniciador Windows; o Maven Wrapper do projeto é uma alternativa.
- Node.js e npm instalados; esta execução foi validada com Node.js 24.15.0 e npm 11.12.1.
- PostgreSQL em execução, com acesso ao banco `restaurante_popular` e ao schema JPA atual.

Para obter o projeto:

```powershell
git clone https://github.com/Os-Batutinhas-de-C-C/Sistema-Restaurante-Popular.git
Set-Location .\Sistema-Restaurante-Popular
```

O banco local deste ambiente já foi inicializado e recebeu a migração de integração. As tabelas JPA atuais começaram vazias e as tabelas legadas foram preservadas, sem importação. Use `validate` nas próximas inicializações. Para preparar outro banco, consulte [backend.md](./backend.md); os scripts antigos de `database/` não correspondem ao modelo JPA atual.

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

Na instalação Windows utilizada neste ambiente, o iniciador seleciona o JDK 25 em `%USERPROFILE%\jdks\temurin-25.0.5.8` e usa o Maven instalado:

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

As tabelas atuais de usuários e credenciais estão inicialmente vazias. Para criar contas de desenvolvimento, configure opcionalmente o perfil `local` e os pares de variáveis `BOOTSTRAP_NUTRICIONISTA_EMAIL`/`BOOTSTRAP_NUTRICIONISTA_PASSWORD`, `BOOTSTRAP_CAIXA_EMAIL`/`BOOTSTRAP_CAIXA_PASSWORD` ou `BOOTSTRAP_GESTOR_EMAIL`/`BOOTSTRAP_GESTOR_PASSWORD` antes de iniciar o backend, conforme [backend.md](./backend.md). Não existem credenciais padrão.

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

Para encerrar o sistema, pressione **Ctrl+C em cada terminal**. No Windows, usar `npm.cmd` evita a dependência da política de execução do script `npm.ps1`.
