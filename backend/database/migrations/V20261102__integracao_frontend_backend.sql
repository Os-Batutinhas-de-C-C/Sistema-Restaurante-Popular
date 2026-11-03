BEGIN;

ALTER TABLE refeicoes
    ADD COLUMN IF NOT EXISTS salada_do_dia VARCHAR(255);

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        CROSS JOIN LATERAL (
            SELECT array_agg(a.attname::text ORDER BY a.attname::text) AS column_names
            FROM unnest(c.conkey) AS key(attnum)
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = key.attnum
        ) cols
        WHERE c.contype = 'u'
          AND n.nspname = current_schema()
          AND t.relname = 'refeicoes'
          AND cols.column_names = ARRAY[
              'acompanhamento1', 'acompanhamento2', 'guarnicao',
              'opcao_proteica', 'proteina', 'sobremesa', 'suco'
          ]::text[]
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', current_schema(), 'refeicoes', constraint_record.conname);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = to_regclass(format('%I.%I', current_schema(), 'refeicoes'))
          AND conname = 'uk_refeicoes_composicao'
    ) THEN
        ALTER TABLE refeicoes ADD CONSTRAINT uk_refeicoes_composicao UNIQUE
            (proteina, guarnicao, acompanhamento1, acompanhamento2, suco, sobremesa, opcao_proteica, salada_do_dia);
    END IF;
END $$;

ALTER TABLE mensagens ALTER COLUMN usuario_id DROP NOT NULL;
ALTER TABLE mensagens ALTER COLUMN texto TYPE VARCHAR(1000);

ALTER TABLE semana_desperdicios ADD COLUMN IF NOT EXISTS posicao INTEGER;
WITH missing_positions AS (
    SELECT target.ctid,
           COALESCE((
               SELECT MAX(existing.posicao)
               FROM semana_desperdicios AS existing
               WHERE existing.semana_id = target.semana_id
           ), -1) + ROW_NUMBER() OVER (PARTITION BY target.semana_id ORDER BY target.ctid) AS next_position
    FROM semana_desperdicios AS target
    WHERE target.posicao IS NULL
)
UPDATE semana_desperdicios AS target
SET posicao = missing_positions.next_position
FROM missing_positions
WHERE target.ctid = missing_positions.ctid;
ALTER TABLE semana_desperdicios ALTER COLUMN posicao SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_semana_desperdicios_posicao
    ON semana_desperdicios (semana_id, posicao);

ALTER TABLE semana_fichas ADD COLUMN IF NOT EXISTS posicao INTEGER;
WITH missing_positions AS (
    SELECT target.ctid,
           COALESCE((
               SELECT MAX(existing.posicao)
               FROM semana_fichas AS existing
               WHERE existing.semana_id = target.semana_id
           ), -1) + ROW_NUMBER() OVER (PARTITION BY target.semana_id ORDER BY target.ctid) AS next_position
    FROM semana_fichas AS target
    WHERE target.posicao IS NULL
)
UPDATE semana_fichas AS target
SET posicao = missing_positions.next_position
FROM missing_positions
WHERE target.ctid = missing_positions.ctid;
ALTER TABLE semana_fichas ALTER COLUMN posicao SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_semana_fichas_posicao
    ON semana_fichas (semana_id, posicao);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM semanas WHERE data IS NULL) THEN
        RAISE EXCEPTION 'Legacy weeks without a date must be assigned a Monday before migration.';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM semanas
        GROUP BY data - (EXTRACT(ISODOW FROM data)::INTEGER - 1)
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Multiple legacy weeks map to the same Monday; merge those week records before migration.';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS semana_cardapio_slots (
    id BIGSERIAL PRIMARY KEY,
    semana_id BIGINT NOT NULL REFERENCES semanas (id_semana),
    posicao INTEGER NOT NULL,
    refeicao_id BIGINT REFERENCES refeicoes (id_refeicao),
    CONSTRAINT uk_semana_cardapio_posicao UNIQUE (semana_id, posicao),
    CONSTRAINT uk_semana_cardapio_refeicao UNIQUE (semana_id, refeicao_id),
    CONSTRAINT ck_semana_cardapio_posicao CHECK (posicao BETWEEN 0 AND 4)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = to_regclass(format('%I.%I', current_schema(), 'semana_cardapio_slots'))
          AND conname = 'ck_semana_cardapio_posicao'
    ) THEN
        ALTER TABLE semana_cardapio_slots ADD CONSTRAINT ck_semana_cardapio_posicao
            CHECK (posicao BETWEEN 0 AND 4);
    END IF;
END $$;

UPDATE semanas
SET data = data - (EXTRACT(ISODOW FROM data)::INTEGER - 1)
WHERE data IS NOT NULL AND EXTRACT(ISODOW FROM data) <> 1;
ALTER TABLE semanas ALTER COLUMN data SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = to_regclass(format('%I.%I', current_schema(), 'semanas'))
          AND conname = 'uk_semanas_data'
    ) THEN
        ALTER TABLE semanas ADD CONSTRAINT uk_semanas_data UNIQUE (data);
    END IF;
END $$;

DO $$
DECLARE
    legacy_table REGCLASS := to_regclass(format('%I.%I', current_schema(), 'semana_refeicoes'));
BEGIN
    IF legacy_table IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM semana_refeicoes GROUP BY semana_id HAVING COUNT(*) > 5
        ) THEN
            RAISE EXCEPTION 'A legacy week has more than five meal links; resolve those rows before migration.';
        END IF;
        EXECUTE 'INSERT INTO semana_cardapio_slots (semana_id, posicao, refeicao_id)
                 SELECT semana_id,
                        (ROW_NUMBER() OVER (PARTITION BY semana_id ORDER BY refeicao_id) - 1)::INTEGER,
                        refeicao_id
                 FROM semana_refeicoes
                 ON CONFLICT (semana_id, posicao) DO NOTHING';
    END IF;
END $$;

COMMIT;
