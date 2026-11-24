BEGIN;

ALTER TABLE inscricoes_oficinas_ou_cursos
    ADD COLUMN presente BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
