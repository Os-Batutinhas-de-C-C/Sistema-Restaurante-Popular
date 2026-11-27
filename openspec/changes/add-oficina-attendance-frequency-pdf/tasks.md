# Tasks

## 1. Persistência e API de frequência

- [x] 1.1 Criar migração aditiva que adiciona `presente BOOLEAN NOT NULL DEFAULT FALSE` às inscrições; verificar a migração em banco PostgreSQL e que inscrições existentes iniciam como Ausente.
- [x] 1.2 Mapear o estado de frequência na entidade e DTOs de inscrição sem mudar a validação ou o contrato atual de e-mail; verificar o mapeamento e a resposta de leitura.
- [x] 1.3 Implementar GET e PUT de frequência protegidos para Gestor, validando início do evento, IDs exclusivos do evento e persistência atômica; verificar autorização, bloqueio antes do início, salvamento a partir do início e correção após o encerramento nos testes de integração da API.
- [x] 1.4 Documentar os contratos de frequência e a aplicação da migração no material do backend; conferir que rotas, payload e procedimento correspondem ao controller e SQL.

## 2. Tela de frequência do Gestor

- [x] 2.1 Adicionar chamadas GET/PUT ao `oficinasService` e criar a rota protegida de frequência usando a estrutura visual MUI das telas de gerenciamento; verificar carregamento, falha e proteção por perfil Gestor.
- [x] 2.2 Ligar a rota tanto à ação da lista de eventos quanto ao modal de inscritos; verificar que os dois caminhos abrem o evento selecionado.
- [x] 2.3 Exibir CPF como `000.000.000-00`, nascimento como `dd/MM/yyyy` e e-mail com fallback “Não informado”; preservar ordem de inscrição, implementar checkbox Presente com padrão desmarcado e resumo de totais; verificar formatação, ordenação, lista vazia com salvar desabilitado, estados inicial/salvo e atualização das contagens.
- [x] 2.4 Implementar busca por CPF com ou sem máscara e por e-mail, além de marcar/desmarcar todos sobre a lista completa; verificar que a busca filtra somente a visualização e que o lote continua incluindo inscritos ocultos.
- [x] 2.5 Implementar botão explícito “Salvar frequência”, estados de edição/salvamento/erro e bloqueio de edição antes do início; verificar salvamento em lote, manutenção das alterações locais após falha e edição após encerramento.
- [ ] 2.6 Verificar responsividade da lista e controles em viewport móvel a partir de 360 px e navegação acessível por teclado.

## 3. Exportação e integração

- [x] 3.1 Adicionar jsPDF e AutoTable e gerar o PDF no navegador com cabeçalho do evento, todos os participantes em ordem de inscrição, status e totais; verificar CPF `000.000.000-00`, nascimento `dd/MM/yyyy`, acentos, e-mail ausente, evento sem inscritos com exportação desabilitada, lista longa, paginação e ausência de campo de assinatura.
- [x] 3.2 Bloquear exportação quando houver alterações não salvas e solicitar salvamento; verificar que a exportação não usa os filtros visuais nem inclui alterações pendentes.
- [ ] 3.3 Percorrer o fluxo Gestor da lista/modal até salvar e baixar o PDF de um evento, verificando os dados no PDF contra a resposta persistida pela API.
