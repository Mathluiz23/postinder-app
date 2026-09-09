# Postinder Mobile

App em React Native (Expo) do desafio acadêmico de aplicativos móveis, para
uma agência de marketing que hoje aprova posts com clientes só via web.
Consome a API REST do backend próprio deste projeto (pasta `backend/`,
Express + PostgreSQL — ver `backend/README.md`).

## Estrutura

```
app/
├── App.tsx                     # entrada do app
├── src/
│   ├── navigation/              # RootStack -> ClientStack / AdminStack
│   ├── screens/
│   │   ├── RoleSelectScreen.tsx
│   │   ├── client/              # Login, fila de aprovação, histórico
│   │   └── admin/                # Login, dashboard, fila consolidada
│   ├── components/
│   │   ├── PostMediaViewer.tsx  # visualização de mídia (imagem, vídeo etc.)
│   │   └── AdjustmentModal.tsx  # modal de solicitação de ajuste
│   ├── services/
│   │   ├── api.ts                # cliente axios + endpoints reais
│   │   ├── authService.ts
│   │   └── postsService.ts
│   └── types/                    # tipos alinhados às entidades do backend
```

## Endpoints usados (confirmados no backend)

| Ação | Método/rota |
|---|---|
| Login (admin ou cliente) | `POST /api/v1/auth/login` — body `{ userType: 'admin' \| 'client', email, password }` |
| Refresh token | `POST /api/v1/auth/refresh` |
| Portal do cliente autenticado | `GET /api/v1/client-portal` |
| Aprovar post (cliente logado) | `POST /api/v1/client-portal/posts/:postId/approve` |
| Solicitar ajuste (cliente logado) | `POST /api/v1/client-portal/posts/:postId/reject` |
| Portal por link/token (sem login) | `GET /api/v1/portal/:token` |
| Aprovar/reprovar por link | `POST /api/v1/portal/:token/posts/:postId/approve` \| `/reject` |
| Fila consolidada (admin) | `GET /api/v1/approvals/queue` |
| Clientes (admin) | `GET /api/v1/clients` |
| Posts (admin) | `GET/POST /api/v1/posts` |
| Métricas por status (admin) | `GET /api/v1/metrics` |
| Registro de push token | `POST /api/v1/notifications/register-token` |

Detalhes de payload que valem a pena lembrar:

- **Aprovar** aceita `positiveReaction: 'loved'` opcional — é o que diferencia o botão "Aprovar" do "Adorei ❤️" no app.
- **Reprovar/ajuste** exige `comment` (obrigatório) e aceita `tags` opcional.
- Toda aprovação/rejeição exige `expectedRevision`, que deve ser o `contentRevision` atual do post (controle de concorrência otimista feito no banco).

## Rodando localmente

Pré-requisito: o backend (pasta `backend/`) já rodando — ver
`backend/README.md`.

```bash
cd app
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL para o IP da sua rede local
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS) ou rode num emulador.

> Use o IP da sua máquina na rede local (ex.: `192.168.1.13`), não
> `localhost`, para funcionar em celular físico via Expo Go — o celular
> precisa estar na mesma rede wifi do computador. A porta padrão do backend
> é `4000` (ver `backend/.env.example`).

## Limitações conhecidas

- Notificações push funcionam de ponta a ponta, mas o Expo Go no Android não
  recebe mais push remoto (política do Google Play/FCM). Validado em iPhone
  físico via Expo Go.
- Refresh token é stateless (sem tabela de revogação) — ver
  `backend/README.md`.
