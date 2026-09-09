-- Dados de demonstração. O placeholder __PUBLIC_HOST__ é substituído por
-- PUBLIC_HOST (db/apply.ts) antes de executar, para que as URLs de mídia
-- funcionem em dispositivos físicos na mesma rede local.

INSERT INTO admins (name, email, password_hash) VALUES
  ('Ana Ferreira', 'admin@agencia.com', crypt('admin123', gen_salt('bf')));

INSERT INTO clients (name, email, password_hash, portal_token, brand_color) VALUES
  ('Loja Aurora', 'cliente@aurora.com', crypt('cliente123', gen_salt('bf')), 'demo-aurora-token', '#F2994A'),
  ('Studio Nômade', 'contato@nomade.com', crypt('cliente123', gen_salt('bf')), 'demo-cliente-token-123', '#2D9CDB');

-- Loja Aurora (fluxo autenticado por login) --------------------------------

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Campanha de Verão - Feed', 'Post de feed para a campanha de verão.', 'pending_approval', ARRAY['instagram'], 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'campanha-verao.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', 'image', 'image/jpeg', 0
FROM posts WHERE title = 'Campanha de Verão - Feed';

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Reels Bastidores', 'Vídeo curto dos bastidores da produção.', 'pending_approval', ARRAY['instagram', 'tiktok'], 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'bastidores.mp4', '__PUBLIC_HOST__/seed-media/bastidores.mp4', '__PUBLIC_HOST__/seed-media/bastidores.mp4', 'video', 'video/mp4', 0
FROM posts WHERE title = 'Reels Bastidores';

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Podcast Semanal - Episódio 12', 'Áudio do episódio para aprovação antes da publicação.', 'pending_approval', ARRAY['spotify'], 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'podcast-ep12.mp3', '__PUBLIC_HOST__/seed-media/podcast.mp3', '__PUBLIC_HOST__/seed-media/podcast.mp3', 'audio', 'audio/mpeg', 0
FROM posts WHERE title = 'Podcast Semanal - Episódio 12';

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Relatório de Métricas - Agosto', 'Relatório mensal para revisão do cliente.', 'pending_approval', ARRAY['email'], 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'relatorio-agosto.pdf', '__PUBLIC_HOST__/seed-media/relatorio.pdf', '__PUBLIC_HOST__/seed-media/relatorio.pdf', 'pdf', 'application/pdf', 0
FROM posts WHERE title = 'Relatório de Métricas - Agosto';

INSERT INTO posts (client_id, title, description, status, channels, content_revision, approved_revision, positive_reaction)
SELECT id, 'Post de Aniversário da Marca', 'Peça já aprovada na semana passada.', 'approved', ARRAY['instagram'], 1, 1, 'loved'
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'aniversario-marca.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', 'image', 'image/jpeg', 0
FROM posts WHERE title = 'Post de Aniversário da Marca';

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Banner Promocional - Rejeitado', 'Peça com ajuste solicitado pelo cliente.', 'rejected', ARRAY['instagram'], 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'banner-promocional.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', 'image', 'image/jpeg', 0
FROM posts WHERE title = 'Banner Promocional - Rejeitado';

INSERT INTO post_feedback (post_id, comment, tags)
SELECT id, 'A cor de fundo não está alinhada com a identidade da marca.', ARRAY['Cor/estilo']
FROM posts WHERE title = 'Banner Promocional - Rejeitado';

INSERT INTO posts (client_id, title, description, status, channels, content_revision, approved_revision)
SELECT id, 'Newsletter de Setembro', 'Já enviada ao público.', 'sent', ARRAY['email'], 1, 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'newsletter-setembro.pdf', '__PUBLIC_HOST__/seed-media/relatorio.pdf', '__PUBLIC_HOST__/seed-media/relatorio.pdf', 'pdf', 'application/pdf', 0
FROM posts WHERE title = 'Newsletter de Setembro';

INSERT INTO posts (client_id, title, description, status, channels, content_revision, approved_revision)
SELECT id, 'Anúncio Pago - Julho', 'Campanha já executada.', 'executed', ARRAY['facebook'], 1, 1
FROM clients WHERE email = 'cliente@aurora.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'anuncio-julho.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', 'image', 'image/jpeg', 0
FROM posts WHERE title = 'Anúncio Pago - Julho';

-- Studio Nômade (fluxo por link/token público) -----------------------------

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Anúncio de Lançamento', 'Peça de lançamento da nova coleção.', 'pending_approval', ARRAY['instagram'], 1
FROM clients WHERE email = 'contato@nomade.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'lancamento.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', '__PUBLIC_HOST__/seed-media/cover.jpg', 'image', 'image/jpeg', 0
FROM posts WHERE title = 'Anúncio de Lançamento';

INSERT INTO posts (client_id, title, description, status, channels, content_revision)
SELECT id, 'Vídeo Institucional', 'Vídeo institucional para aprovação via link.', 'pending_approval', ARRAY['youtube'], 1
FROM clients WHERE email = 'contato@nomade.com';

INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
SELECT id, 'institucional.mp4', '__PUBLIC_HOST__/seed-media/bastidores.mp4', '__PUBLIC_HOST__/seed-media/bastidores.mp4', 'video', 'video/mp4', 0
FROM posts WHERE title = 'Vídeo Institucional';
