# Change log — Correções visuais e de navegação dos painéis

## 09/11/2026 — Registro inicial

- Criada a spec para corrigir o indicador de fichas no painel da Nutricionista.
- Aprovada a remoção global do texto de fichas restantes, preservando capacidade, percentual e barra.
- Aprovado um botão de adição no cabeçalho da tela Cardápios, usando a segunda-feira da semana selecionada.
- Aprovada a exibição de pendências e a navegação de adição para qualquer semana selecionada.
- Aprovado o item “Início” no menu do Caixa, apontando para `/painel-caixa`.

## 09/11/2026 — Implementação

- O resumo de fichas da Nutricionista passou a exibir percentual e barra linear.
- O texto de fichas restantes foi removido das telas pública, Nutricionista/Gestor e Caixa.
- A tela de Cardápios passou a exibir o botão de adição no cabeçalho e cinco dias pendentes quando a semana selecionada não possui registro.
- A variante Caixa passou a exibir “Início” e navegar para `/painel-caixa`.
- `npm run lint` e `npm run build` passaram com a URL local do backend configurada.

## 09/11/2026 — Revisão solicitada

- O cartão da Nutricionista foi ajustado para usar os mesmos campos do Caixa: `entregues / capacidade`, percentual e barra de progresso.
- O texto separado “Capacidade diária” foi removido do cartão da Nutricionista.
- O botão “Adicionar cardápio do dia” foi removido da tela de Cardápios; as pendências continuam visíveis.
