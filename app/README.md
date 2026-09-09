# Postinder Mobile

MVP em React Native (Expo) do aplicativo mobile do Postinder, desenvolvido como
parte do desafio acadêmico de aplicativos móveis. Consome a API REST real do
backend Postinder (Express + PostgreSQL), com endpoints confirmados
diretamente no código-fonte do repositório (`Postinder/Postinder`, branch
`newStructure`, `backend/src/app.ts` e módulos `auth`, `portal`, `posts`,
`clients`, `approvals`).

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

Detalhes de payload que valem a pena lembrar:

- **Aprovar** aceita `positiveReaction: 'loved'` opcional — é o que diferencia o botão "Aprovar" do "Adorei ❤️" no app.
- **Reprovar/ajuste** exige `comment` (obrigatório) e aceita `tags` opcional.
- Toda aprovação/rejeição exige `expectedRevision`, que deve ser o `contentRevision` atual do post (controle de concorrência otimista feito no banco).

## Rodando localmente

```bash
cd app
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS) ou rode num emulador.

Configure a URL da API antes de rodar (arquivo `.env`):

```
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3001
```

> Use o IP da sua máquina na rede local, não `localhost`, se for testar no
> celular físico via Expo Go. Confirme a porta real no `docker-compose.yml`/
> `.env.example` do backend.

## O que ainda é MVP / próximos passos

- Fluxo de acesso por **link mágico/token** está implementado nos serviços
  (`fetchPublicPortal`, `approvePublicPost`, `rejectPublicPost`) mas ainda sem
  tela própria — hoje só o fluxo autenticado (login) tem UI.
- Viewer nativo de vídeo/áudio/PDF (`expo-av`, `react-native-webview`) —
  hoje só imagem renderiza de fato, os demais tipos mostram placeholder.
- Notificações push reais via `expo-notifications`, integradas ao módulo
  `notifications` do backend (`GET/POST /api/v1/notifications`).
- Refresh token automático no interceptor do axios ao receber 401.
- Endpoint de fila consolidada do admin (`/api/v1/approvals/queue`) retorna
  arquivos por post — vale reaproveitar `PostMediaViewer` também na tela do
  admin.
