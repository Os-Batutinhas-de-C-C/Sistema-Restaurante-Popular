BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM usuarios
        WHERE email_recuperacao IS NOT NULL
        GROUP BY email_recuperacao
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate login emails must be resolved before applying the profile migration.';
    END IF;
END $$;

ALTER TABLE credenciais_autenticacao
    ADD COLUMN IF NOT EXISTS versao_token BIGINT NOT NULL DEFAULT 0;
ALTER TABLE credenciais_autenticacao ALTER COLUMN versao_token SET DEFAULT 0;
UPDATE credenciais_autenticacao SET versao_token = 0 WHERE versao_token IS NULL;
ALTER TABLE credenciais_autenticacao ALTER COLUMN versao_token SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'usuarios'::regclass
          AND conname = 'uk_usuarios_email_recuperacao'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT uk_usuarios_email_recuperacao
            UNIQUE (email_recuperacao);
    END IF;
END $$;

COMMIT;
