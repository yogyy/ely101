import "dotenv/config";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { notes } from "./schema";
const sqlite = new Database(process.env.DB_FILE_NAME!);

export const db = drizzle({ client: sqlite, schema: { notes } });
