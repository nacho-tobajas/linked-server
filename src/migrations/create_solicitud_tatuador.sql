-- Migración: tabla de solicitudes de registro como tatuador
-- Ejecutar manualmente en la base de datos

CREATE TABLE IF NOT EXISTS tat_solicitud_tatuador (
  id                   SERIAL PRIMARY KEY,
  id_user              INTEGER NOT NULL REFERENCES swe_usrapl(id),
  estudio              VARCHAR(100),
  especialidades_ids   JSONB,
  status               VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  notas                TEXT,
  admin_user           VARCHAR(255),
  creationtimestamp    TIMESTAMP NOT NULL DEFAULT NOW(),
  modificationtimestamp TIMESTAMP
);

-- Rol Tatuador (id=4) — insertarlo si no existe
INSERT INTO swe_rolapl (id, description, status, creationuser, creationtimestamp)
VALUES (4, 'Tatuador', true, 'admin', NOW())
ON CONFLICT (id) DO NOTHING;
