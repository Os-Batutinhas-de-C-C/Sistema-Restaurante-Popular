export const ACCOUNT_FIELDS = [
  { id: "full-name", label: "Nome Completo", autoComplete: "name" },
  { id: "recovery-email", label: "E-mail de Recuperação", type: "email", autoComplete: "email" },
  { id: "access-level", label: "Nível de Acesso", disabled: true },
];

export const PASSWORD_FIELDS = [
  { id: "current-password", placeholder: "Senha Atual", autoComplete: "current-password" },
  { id: "new-password", placeholder: "Nova Senha", autoComplete: "new-password" },
  { id: "confirm-password", placeholder: "Confirmar Nova Senha", autoComplete: "new-password" },
];
