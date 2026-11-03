"use client";

import { Alert, Button, CircularProgress, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { ACCOUNT_FIELDS, PASSWORD_FIELDS } from "./perfilFields";
import useMeuPerfil from "./useMeuPerfil";
import styles from "./style.module.css";
import NavbarPainel from "@/components/NavbarPainel/NavbarPainel";

const MeuPerfil = () => {
  const state = useMeuPerfil();
  const perfil = state.perfil?.perfil ?? state.usuarioInicial?.perfil ?? "";
  const disabled = state.loading || !state.perfil || state.busy;

  return (
    <main className={styles.main}>
      <NavbarPainel variant={perfil === "Caixa" ? "caixa" : "nutricionista"} />
      <div className={styles.container}>
        <header className={styles.header}>
          <Typography component="h1" className={styles.title}>
            Meu Perfil
          </Typography>
          <Typography className={styles.subtitle}>
            Gerencie suas credenciais de acesso e segurança
          </Typography>
        </header>

        {state.loading && <Alert severity="info">Carregando suas informações...</Alert>}
        {state.loadError && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={state.retry}>Tentar novamente</Button>}>
            {state.loadError}
          </Alert>
        )}

        <div className={styles.grid}>
          <Paper
            component="section"
            elevation={0}
            variant="outlined"
            className={styles.card}
          >
            <form className={styles.form} onSubmit={state.saveAccount} noValidate>
              <Typography component="h2" className={styles.sectionTitle}>
                Informações da Conta
              </Typography>

              <div className={styles.fields}>
                {ACCOUNT_FIELDS.map((field) => (
                  <TextField
                    key={field.id}
                    fullWidth
                    disabled={field.disabled || disabled}
                    id={field.id}
                    label={field.label}
                    name={field.id}
                    onChange={state.handleAccountChange}
                    type={field.type ?? "text"}
                    autoComplete={field.autoComplete}
                    required={!field.disabled}
                    error={Boolean(state.accountErrors[field.id])}
                    helperText={state.accountErrors[field.id]}
                    size="small"
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { "data-id": field.id },
                    }}
                    className={`${styles.field} ${
                      field.disabled ? styles.fieldDisabled : ""
                    }`}
                    value={
                      field.disabled ? perfil : state.accountValues[field.id]
                    }
                    variant="outlined"
                  />
                ))}
                {state.emailChanged && (
                  <TextField
                    fullWidth required id="account-password" name="account-password"
                    label="Senha atual para alterar o e-mail" type="password" autoComplete="current-password"
                    value={state.accountPassword} onChange={(event) => state.changeAccountPassword(event.target.value)}
                    disabled={disabled} error={Boolean(state.accountErrors["account-password"])}
                    helperText={state.accountErrors["account-password"] || "O e-mail também é utilizado para entrar no sistema."}
                    size="small" variant="outlined" className={styles.field}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              </div>

              {state.accountError && <Alert severity="error">{state.accountError}</Alert>}

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="outlined"
                  className={styles.button}
                  disabled={disabled}
                  startIcon={state.savingAccount ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {state.savingAccount ? "Salvando..." : "Salvar Informações"}
                </Button>
              </div>
            </form>
          </Paper>

          <Paper
            component="section"
            elevation={0}
            variant="outlined"
            className={styles.card}
          >
            <form className={styles.form} onSubmit={state.savePassword} noValidate>
              <Typography component="h2" className={styles.sectionTitle}>
                Alterar Senha
              </Typography>

              <div className={styles.fields}>
                {PASSWORD_FIELDS.map((field) => (
                  <TextField
                    key={field.id}
                    fullWidth
                    id={field.id}
                    name={field.id}
                    onChange={state.handlePasswordChange}
                    autoComplete={field.autoComplete}
                    disabled={disabled}
                    required
                    error={Boolean(state.passwordErrors[field.id])}
                    helperText={state.passwordErrors[field.id]}
                    placeholder={field.placeholder}
                    size="small"
                    slotProps={{
                      htmlInput: {
                        "data-id": field.id,
                        "aria-label": field.placeholder,
                      },
                    }}
                    className={styles.field}
                    type="password"
                    value={state.passwordValues[field.id]}
                    variant="outlined"
                  />
                ))}
              </div>

              {state.passwordError && <Alert severity="error">{state.passwordError}</Alert>}

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="contained"
                  className={styles.button}
                  disabled={disabled}
                  startIcon={state.savingPassword ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {state.savingPassword ? "Atualizando..." : "Atualizar Senha"}
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
      <Snackbar open={Boolean(state.success)} autoHideDuration={5000} onClose={() => state.setSuccess("")}>
        <Alert severity="success" variant="filled" onClose={() => state.setSuccess("")}>{state.success}</Alert>
      </Snackbar>
    </main>
  );
};

export default MeuPerfil;
