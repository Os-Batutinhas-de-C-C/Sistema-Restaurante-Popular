# Tasks

## 1. Seleção de sugestões históricas

- [x] 1.1 Implementar no serviço de gerenciamento a seleção de uma composição histórica completa, excluindo refeições já usadas em outros dias da semana e permitindo outra opção elegível; verificar a cobertura de histórico vazio, registros incompletos, duplicidades semanais e nova sugestão no teste de serviço.
- [x] 1.2 Mapear todos os campos da refeição histórica para os campos do formulário, incluindo calorias; verificar a cobertura dos campos e do identificador nos testes dos serviços.
- [x] 1.3 Executar os testes focados dos serviços e confirmar que passam.

## 2. Integração do botão e estados da tela

- [x] 2.1 Conectar “Gerar Cardápio” ao serviço e preencher o estado atual do formulário sem chamar a persistência; verificar no teste do componente que o dia não muda e que apenas “Salvar Cardápio” persiste.
- [x] 2.2 Exibir carregamento, indisponibilidade e falha sem apagar os valores atuais; verificar a cobertura desses estados nos testes do componente.
- [x] 2.3 Permitir editar a sugestão e gerar outra opção sem persistência automática; verificar no teste do componente que a ação “Salvar Cardápio” continua sendo a única que persiste alterações.
- [x] 2.4 Inspecionar a tela no navegador em largura de 360 px e confirmar que os controles continuam responsivos.

## 3. Integração e autorização

- [x] 3.1 Reutilizar a consulta de semanas sem endpoint novo e confirmar por inspeção que a rota permanece protegida para Nutricionista.
- [x] 3.2 Executar os testes focados do frontend e confirmar que a integração e os controles de acesso permanecem válidos.
