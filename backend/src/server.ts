import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Postinder backend rodando em http://localhost:${env.port}`);
  console.log(`URL pública (mídia/LAN): ${env.publicHost}`);
});
