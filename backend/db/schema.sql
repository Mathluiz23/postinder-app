-- Schema simplificado do backend Postinder (recriado do zero para o app
-- mobile), cobrindo só as entidades necessárias aos endpoints consumidos
-- pelo app: auth, client-portal, portal público, approvals, clients,
-- posts e notifications.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS push_tokens CASCADE;
DROP TABLE IF EXISTS post_feedback CASCADE;
DROP TABLE IF EXISTS post_files CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  brand_color TEXT,
  portal_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'draft', 'ready', 'sent', 'pending_approval', 'approved',
    'rejected', 'executed', 'scheduled', 'published'
  )),
  channels TEXT[] NOT NULL DEFAULT '{}',
  formats JSONB NOT NULL DEFAULT '{}',
  scheduled_date TIMESTAMPTZ,
  content_revision INT NOT NULL DEFAULT 1,
  approved_revision INT,
  positive_reaction TEXT CHECK (positive_reaction IN ('loved')),
  email_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE post_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  storage_url TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN (
    'image', 'video', 'audio', 'pdf', 'document', 'spreadsheet', 'presentation'
  )),
  mime_type TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);

CREATE TABLE post_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('admin', 'client')),
  owner_id UUID NOT NULL,
  expo_push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_type, owner_id, expo_push_token)
);

CREATE INDEX idx_posts_client_id ON posts(client_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_post_files_post_id ON post_files(post_id);
CREATE INDEX idx_post_feedback_post_id ON post_feedback(post_id);
