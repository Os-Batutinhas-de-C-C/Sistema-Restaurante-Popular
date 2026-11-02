# Instruções do projeto — Restaurante Popular de Quixadá

## Objetivo

Construir o frontend da plataforma de gestão e informação do **Restaurante Popular de Quixadá**, oferecendo uma experiência acessível e fluida para clientes (estudantes e comunidade), nutricionistas, caixas e administradores.

## Stack obrigatória

- **Framework:** Next.js com App Router e React, utilizando JavaScript (conforme a inicialização existente em `src/app/`).
- **Componentes visuais:** Material UI (MUI) como biblioteca principal de interface, combinada com CSS Modules ou estilos escopados por funcionalidade.
- **Ícones:** Material Icons e Lucide Icons (reutilize dependências do `package.json` sem adicionar bibliotecas adicionais sem necessidade especificada).
- **Diretrizes de renderização:** Use **Server Components** por padrão. Adicione a diretiva `"use client"` estritamente nos componentes que exigirem estado reativo, eventos ou APIs do navegador.
- Mantenha a separação entre rotas (`src/app/`), componentes reutilizáveis (`src/components/`), integrações/mocks HTTP (`src/services/`) e funções puras (`src/utils/`).
- Nunca coloque credenciais, segredos, tokens ou dados pessoais reais no código versionado.
- Use dependências pequenas e justificadas. Não introduza outra linguagem, framework ou banco de dados sem solicitação explícita.

## Princípio de trabalho: Spec-Driven Development (SDD) & Design First

Trabalhe de forma **Spec First** e **Design First**. Antes de propor, alterar ou implementar qualquer código de uma funcionalidade:

1. Leia integralmente os arquivos `requirements.md`, `design.md` e `tasks.md` presentes no diretório `specs/<id-nome>/` correspondente.
2. Entenda o objetivo do usuário, os papéis envolvidos (ex: Nutricionista, Caixa, Clientes, Administrador) e o contexto de uso.
3. Inspecione os layouts e referências visuais disponíveis no diretório `docs/interface/` para garantir fidelidade ao Figma/design.
4. Apresente um plano curto baseado no arquivo `tasks.md` e aguarde a confirmação do usuário antes de iniciar a escrita do código.
5. Implemente estritamente o escopo especificado, preservando a rastreabilidade dos identificadores (RF, RNF, HU, RN, CA).

## Prioridade: UI/UX e Acessibilidade

- **Mobile-First:** Projete para uso fluido em telas a partir de 360 px, sem rolagem horizontal indesejada, adaptando-se até resoluções desktop.
- **Acessibilidade:** Utilize HTML semântico, rótulos associados aos campos, foco visível, contraste adequado e suporte aos controles de alto contraste no portal público.
- **Linguagem:** Use Português do Brasil em rótulos, mensagens do sistema e dados demonstrativos.
- **Estados Visuais:** Implemente explicitamente estados de carregamento (*loading*), lista vazia, erro e sucesso para todas as telas e fluxos.
- **Hierarquia e Clareza:** Torne evidentes as ações principais (consultar cardápio, comprar/validar bilhete, registrar desperdício). Não comunique estado ou gravidade apenas por cor.
- Preserve os dados digitados pelo usuário ao tratar falhas de submissão de formulários.
- Use conteúdo demonstrativo claramente fictício. Não apresente dados de exemplo como informações reais.

## Domínio e termos

- **Cardápio:** Planejamento nutricional diário/semanal cadastrado pela equipe de nutrição.
- **Ticket / Bilhete:** Comprovante digital ou impresso para acesso à refeição, vendido e validado nos guichês/caixas.
- **Desperdício / Resíduos:** Registro diário de sobras limpas e restos para relatórios operacionais.
- **Cliente:** Usuário consumidor do restaurante (estudantes, trabalhadores e comunidade em geral).
- O portal público deve destacar o cardápio do dia, horários de funcionamento, avisos e controles de acessibilidade.
- Não invente regras operacionais, permissões ou políticas tarifárias que não estejam definidas na spec. Registre a lacuna e adote a alternativa mais simples e segura até que haja orientação.

## Organização e qualidade técnica

- Prefira módulos e componentes pequenos, com responsabilidades explícitas.
- Para telas novas, siga o padrão atômico já usado em `src/components/PainelNutricionista/`: crie uma pasta específica em `src/components/<NomeDaTela>/`, separe cada parte visual em seu próprio componente e stylesheet quando necessário, e monte a tela em um componente de composição. Mantenha o `page.js` da rota enxuto, apenas conectando a tela.
- Antes de desenhar um controle visual ou gráfico manualmente, procure e use o componente pronto correspondente do MUI/MUI X já instalado ou especificado. Use `@mui/x-charts` para gráficos e não recrie gráficos com elementos HTML/CSS.
- Prefira as versões gratuitas das bibliotecas; não use componentes MUI X Pro pagos quando houver uma alternativa gratuita especificada, como `@daypicker/react` com `<DayPicker mode="range" />` para selecionar intervalos de datas.
- Use HTML nativo apenas para estrutura semântica quando não houver um componente MUI equivalente; não substitua componentes de interface disponíveis no MUI por marcação HTML/CSS artesanal.
- Mantenha integrações HTTP e chamadas de dados simulados (mocks) centralizadas em `src/services/`.
- Faça a interface tratar erros de rede e respostas inesperadas de forma amigável, sem perder os dados preenchidos.
- Não adicione novas bibliotecas ou gerenciadores de estado global por suposição sem consulta prévia.
- Atualize o progresso das tarefas no `tasks.md` (marcando `[x]`) à medida que forem implementadas e validadas.
- Faça alterações focadas; não reestruture partes do código que não estejam relacionadas ao pedido.

## Verificação antes de concluir

- Verifique a renderização e o comportamento nos principais tamanhos de tela (mobile a partir de 360 px até desktop).
- Confirme estados vazios, mensagens de validação e comportamentos de erro relevantes para a funcionalidade.
- Confirme a aderência aos critérios de aceite (CA) definidos no `requirements.md`.
- Informe claramente quais arquivos foram criados ou alterados, quais requisitos foram cobertos e limitações ou pendências identificadas.

## Interface do sistema

- Use como base para cores, tipografia, espaçamentos e layouts os arquivos disponibilizados na pasta `docs/interface/`.

# Como trabalhar neste repositório

1. Antes de implementar, leia a spec em `specs/<id-nome>/` (`requirements.md`, `design.md`, `tasks.md`).
2. Não implemente nada fora da spec. Se algo estiver ambíguo, pare e pergunte.
3. Siga a ordem numérica das pastas em `specs/`.
4. Mantenha o código-fonte em `src/`, respeitando a estrutura do Next.js App Router existente.
5. Use as referências de interface disponibilizadas em `docs/interface/` como base para todas as telas do sistema.
6. Use a interfaces disponibilizadad em `docs/interface/` para tipografias e cores deste projeto.
