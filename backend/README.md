# Postinder Backend (novo, simplificado)

Backend próprio, construído do zero para servir o app mobile do desafio
acadêmico. Implementa apenas os endpoints que o app já espera (contratos
definidos em `app/src/services/api.ts` e `app/README.md`), sem depender do
repositório real do Postinder — o front web dele não é usado pela entidade
parceira, então divergir não é problema.

Stack: Node + TypeScript + Express + PostgreSQL, sem ORM/framework de
migration (schema aplicado por um script único).

## Rodando localmente

```bash
cd backend
cp .env.example .env   # ajuste PUBLIC_HOST para o IP LAN da sua máquina
npm install
docker compose up -d   # sobe Postgres na porta 5433 (5432 já estava em uso)
npm run db:setup       # aplica schema.sql + seed.sql
npm run dev            # servidor em http://localhost:4000
```

> `PUBLIC_HOST` é usado para montar as URLs de mídia servidas em
> `/seed-media` — use o IP da rede local (ex.: `192.168.1.13`), não
> `localhost`, para funcionar em dispositivos físicos via Expo Go.

## Credenciais de demonstração (seed)

| Papel | Email | Senha | Observação |
|---|---|---|---|
| Admin (agência) | admin@agencia.com | admin123 | |
| Cliente | cliente@aurora.com | cliente123 | Fluxo autenticado (login) |
| Cliente | contato@nomade.com | cliente123 | portal_token fixo: `demo-cliente-token-123` (fluxo por link público) |

## Endpoints

Ver `app/README.md` para a tabela completa — os contratos (body, respostas,
`expectedRevision`, `positiveReaction`, `comment`/`tags`) são implementados
exatamente como documentado ali.

## Limitações conhecidas (trade-offs assumidos)

- **Refresh token stateless**: sem tabela de revogação. Um refresh token
  emitido continua válido até expirar (30 dias por padrão), mesmo após
  logout. Aceitável para o escopo acadêmico.
- **Sem upload real de arquivos**: a mídia de demonstração é servida
  estaticamente de `public/seed-media/`. Não há endpoint de upload.
- **Push notifications**: dependem do app registrar um Expo push token via
  `POST /api/v1/notifications/register-token`. Expo Go no Android não
  recebe mais push remoto (política do Google Play/FCM) — validado em
  iPhone físico via Expo Go.
