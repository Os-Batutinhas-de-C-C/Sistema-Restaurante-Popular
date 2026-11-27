# Tasks

## 1. Popular o histórico local

- [ ] 1.1 Adicionar cinco composições completas e únicas ao inicializador restrito ao perfil `local`; verificar que cada campo exigido pelo gerador está preenchido e que as cinco podem ser lidas via `GET /api/semanas`.
- [ ] 1.2 Tornar a criação idempotente e não destrutiva, tratando uma data de semana já ocupada sem substituir histórico; verificar que duas inicializações não duplicam as refeições.

## 2. Verificar a integração do gerador

- [ ] 2.1 Verificar com o perfil `local` que o gerador consegue sugerir combinações distintas a partir das cinco refeições e que perfis diferentes não recebem os dados de exemplo.
- [x] 2.2 Registrar a finalidade e a restrição ao ambiente local junto aos dados de demonstração; verificar que a documentação identifica essas refeições como exemplos, não como histórico real.
