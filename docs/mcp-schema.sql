-- Esquema que añade @payloadcms/plugin-mcp.
-- Idempotente: se puede ejecutar varias veces sin efectos adicionales.
BEGIN;

CREATE TABLE IF NOT EXISTS payload_mcp_api_keys (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  label varchar,
  description varchar,
  recipes_find boolean DEFAULT false,
  recipes_create boolean DEFAULT false,
  recipes_update boolean DEFAULT false,
  categories_find boolean DEFAULT false,
  media_find boolean DEFAULT false,
  payload_mcp_tool_search_recipes boolean DEFAULT true,
  payload_mcp_tool_upload_recipe_photo boolean DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  enable_a_p_i_key boolean,
  api_key varchar,
  api_key_index varchar
);

ALTER TABLE payload_mcp_api_keys
  DROP CONSTRAINT IF EXISTS payload_mcp_api_keys_user_id_users_id_fk;
ALTER TABLE payload_mcp_api_keys
  ADD CONSTRAINT payload_mcp_api_keys_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS payload_mcp_api_keys_user_idx
  ON payload_mcp_api_keys (user_id);
CREATE INDEX IF NOT EXISTS payload_mcp_api_keys_updated_at_idx
  ON payload_mcp_api_keys (updated_at);
CREATE INDEX IF NOT EXISTS payload_mcp_api_keys_created_at_idx
  ON payload_mcp_api_keys (created_at);

ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS payload_mcp_api_keys_id integer;
ALTER TABLE payload_locked_documents_rels
  DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_payload_mcp_api_keys_fk;
ALTER TABLE payload_locked_documents_rels
  ADD CONSTRAINT payload_locked_documents_rels_payload_mcp_api_keys_fk
  FOREIGN KEY (payload_mcp_api_keys_id) REFERENCES payload_mcp_api_keys(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_payload_mcp_api_keys_id_idx
  ON payload_locked_documents_rels (payload_mcp_api_keys_id);

ALTER TABLE payload_preferences_rels
  ADD COLUMN IF NOT EXISTS payload_mcp_api_keys_id integer;
ALTER TABLE payload_preferences_rels
  DROP CONSTRAINT IF EXISTS payload_preferences_rels_payload_mcp_api_keys_fk;
ALTER TABLE payload_preferences_rels
  ADD CONSTRAINT payload_preferences_rels_payload_mcp_api_keys_fk
  FOREIGN KEY (payload_mcp_api_keys_id) REFERENCES payload_mcp_api_keys(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS payload_preferences_rels_payload_mcp_api_keys_id_idx
  ON payload_preferences_rels (payload_mcp_api_keys_id);

COMMIT;
