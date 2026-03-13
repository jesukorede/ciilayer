import { createApp } from "./app.js";
import { openDb } from "./config/database.js";
import { env } from "./config/env.js";

async function main() {
  const db = await openDb();
  const app = createApp(db);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`CiiLayer backend listening on http://localhost:${env.port}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
