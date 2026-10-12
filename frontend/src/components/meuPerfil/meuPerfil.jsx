"use client";

import { Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./style.module.css";

const accountFields = [
  {
    id: "full-name",
    label: "Nome Completo",
    value: "Marlianne Costa",
  },
  {
    id: "recovery-email",
    label: "E-mail de Recuperação",
    value: "nutricao.quixada@gmail.com",
  },
  {
    id: "access-level",
    label: "Nível de Acesso",
    value: "Nutricionista / Administrador",
    disabled: true,
  },
];

const passwordFields = [
  {
    id: "current-password",
    placeholder: "Senha Atual",
  },
  {
    id: "new-password",
    placeholder: "Nova Senha",
  },
  {
    id: "confirm-password",
    placeholder: "Confirmar Nova Senha",
  },
];

const MeuPerfil = () => {
  const [accountValues, setAccountValues] = useState({
    "full-name": "Nome da Silva",
    "recovery-email": "nutricao@gmail.com",
  });
  const [passwordValues, setPasswordValues] = useState({
    "current-password": "",
    "new-password": "",
    "confirm-password": "",
  });

  const handleAccountChange = (event) => {
    const { name, value } = event.target;

    setAccountValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Typography component="h1" className={styles.title}>
            Meu Perfil
          </Typography>
          <Typography className={styles.subtitle}>
            Gerencie suas credenciais de acesso e segurança
          </Typography>
        </header>

        <div className={styles.grid}>
          <Paper
            component="section"
            elevation={0}
            variant="outlined"
            className={styles.card}
          >
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Typography component="h2" className={styles.sectionTitle}>
                Informações da Conta
              </Typography>

              <div className={styles.fields}>
                {accountFields.map((field) => (
                  <TextField
                    key={field.id}
                    fullWidth
                    disabled={field.disabled}
                    id={field.id}
                    label={field.label}
                    name={field.id}
                    onChange={handleAccountChange}
                    size="small"
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { "data-id": field.id },
                    }}
                    className={`${styles.field} ${
                      field.disabled ? styles.fieldDisabled : ""
                    }`}
                    value={
                      field.disabled ? field.value : accountValues[field.id]
                    }
                    variant="outlined"
                  />
                ))}
              </div>

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="outlined"
                  className={styles.button}
                >
                  Salvar Informações
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
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Typography component="h2" className={styles.sectionTitle}>
                Alterar Senha
              </Typography>

              <div className={styles.fields}>
                {passwordFields.map((field) => (
                  <TextField
                    key={field.id}
                    fullWidth
                    id={field.id}
                    name={field.id}
                    onChange={handlePasswordChange}
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
                    value={passwordValues[field.id]}
                    variant="outlined"
                  />
                ))}
              </div>

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="contained"
                  className={styles.button}
                >
                  Atualizar Senha
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </main>
  );
};

export default MeuPerfil;