# Requisitos — Gerenciamento de Cardápio e Histórico

## Objetivo

Permitir que a nutricionista cadastre, edite e acompanhe a composição nutricional dos pratos do dia, além de oferecer a funcionalidade de duplicar cardápios do histórico para acelerar o planejamento.

## Histórias de usuário

### HU003 — Agilidade da criação/edição
Como nutricionista/gestão,
quero poder criar e editar o cardápio do dia de forma rápida,
para refletir imprevistos da cozinha e manter a operação atualizada.

### HU016 — Duplicação de cardápios
Como uma nutricionista,
quero poder visualizar o histórico de cardápios anteriores e copiá-los para o dia em edição,
para economizar tempo no cadastro de pratos e combinações recorrentes.

## Regras de negócio

- **RN01:** A tela de gerenciamento de cardápio deve exibir o intervalo da semana em andamento no cabeçalho e permitir a navegação entre os dias da semana (Segunda a Sexta).
- **RN02:** O formulário de composição nutricional deve conter campos para: Prato Proteico, Opção Proteica, Acompanhamento 1, Acompanhamento 2, Guarnição, Salada do Dia, Sobremesa, Suco Natural e Valor Calórico Estimado (kcal).
- **RN03:** O botão "Gerar Cardápio" (associado ao RF005) deverá, em um momento futuro de integração backend, preencher os campos automaticamente com base em sugestões. Por ora, seu comportamento no frontend será apenas de *stub* (sem ação complexa).
- **RN04:** O botão "Copiar Do Histórico" deve abrir um Modal (Dialog) sobreposto à tela.
- **RN05:** O Modal de Histórico deve permitir filtrar cardápios passados por "Data inicial", "Data final" e "Pesquisar" (texto livre, ex: prato principal).
- **RN06:** No Modal de Histórico, a nutricionista só pode selecionar um cardápio por vez (Radio Button). A seleção copia os dados daquele dia para os campos do formulário atual, substituindo o que estiver preenchido.
- **RN07:** O botão "Salvar Cardápio" deve consolidar as edições do dia. (Como é frontend puro, os dados mockados devem refletir a alteração em memória temporária).

## Critérios de aceitação

### Cenário 1 — Edição manual
**Dado que** a nutricionista acessa a tela de gerenciamento de um dia específico (ex: Quarta-feira, 23/09)  
**Quando** preenche os campos e clica em "Salvar Cardápio"  
**Então** o sistema salva as alterações e exibe um feedback de sucesso (ex: Snackbar).

### Cenário 2 — Seleção de histórico
**Dado que** a nutricionista clica em "Copiar Do Histórico"  
**Quando** seleciona um dia na lista do modal e clica em "Selecionar Cardápio"  
**Então** o modal é fechado e os campos do formulário de gerenciamento são preenchidos instantaneamente com os dados do cardápio selecionado.

## Restrições
- O sistema ainda não possui backend. O salvamento, a pesquisa de histórico e a geração de cardápio devem operar em cima de mocks locais (arquivos JSON ou states).
- Seguir os Design Tokens mapeados (MUI) rigorosamente.