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

## ⚙️ Como Executar o Projeto (Primeiros Passos - Frontend)

Siga os passos abaixo no seu terminal para rodar o projeto localmente em sua máquina:

1. Clonar o repositório:
   git clone https://github.com/Os-Batutinhas-de-C-C/Sistema-Restaurante-Popular.git
   
   cd frontend
3. Instalar as dependências do projeto:
   npm install
4. Iniciar o servidor de desenvolvimento:
   npm run dev
5. Acessar a aplicação:
   Após o comando finalizar, abra o seu navegador e acesse http://localhost:3000

> 💡 Dicas para a equipe:
>
> - Sempre que você baixar atualizações do projeto, rode o comando npm install novamente para garantir que nenhuma dependência nova fique de fora da sua máquina.
> - Para parar o servidor de desenvolvimento no terminal, pressione Ctrl + C.
