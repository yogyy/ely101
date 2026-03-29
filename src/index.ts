import Elysia from "elysia";
import { logger } from "./lib/logger";
import { notesRoute } from "./routes/notes";

const app = new Elysia()
  .onRequest(({ request }) => {
    logger.info({ method: request.method, url: request.url });
  })
  .get("/", async () => ({
    message: "Notes API starter is running",
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .use(notesRoute)
  .listen(3000);

logger.info(
  `API running at http://${app.server?.hostname}:${app.server?.port}`
);
