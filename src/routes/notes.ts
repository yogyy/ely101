import { Elysia, t } from "elysia";
import { db } from "../db";
import { Notes, notes } from "../db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { nanoid } from "nanoid";

const createNoteBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 120 }),
  content: t.String({ minLength: 1 }),
  tags: t.Optional(
    t.Array(t.String({ minLength: 1, maxLength: 24 }), { maxItems: 10 })
  ),
});

const updateNoteBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  content: t.Optional(t.String({ minLength: 1 })),
  tags: t.Optional(
    t.Array(t.String({ minLength: 1, maxLength: 24 }), { maxItems: 10 })
  ),
});

const noteIdParams = t.Object({
  id: t.String({ minLength: 10, maxLength: 14 }),
});

export const notesRoute = new Elysia()
  .get("/notes", async () => {
    logger.info(process.env.NODE_ENV);
    const data = await db.query.notes.findMany();
    return { data };
  })
  .get(
    "/notes/:id",
    async ({ params, set }) => {
      const note = await db.query.notes.findFirst({
        where: eq(notes.id, params.id),
      });

      if (!note) {
        set.status = 404;
        return { message: "Note not found" };
      }
      return { data: note };
    },
    {
      params: noteIdParams,
    }
  )
  .post(
    "/notes",
    async ({ body, set }) => {
      const now = new Date();
      const note: Notes = {
        id: nanoid(14),
        title: body.title,
        content: body.content,
        tags: body.tags ?? [],
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(notes).values(note);
      set.status = 201;
      return { data: note };
    },
    { body: createNoteBody }
  )
  .patch(
    "/notes/:id",
    async ({ params, body, set }) => {
      const note = await db.select().from(notes).where(eq(notes.id, params.id));

      if (!note) {
        set.status = 404;
        return { message: "Note not found" };
      }

      await db
        .update(notes)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(notes.id, params.id));

      return { data: note };
    },
    {
      params: noteIdParams,
      body: updateNoteBody,
    }
  )
  .delete(
    "/notes/:id",
    async ({ params, set }) => {
      const data = await db
        .delete(notes)
        .where(eq(notes.id, params.id))
        .returning({ title: notes.title });

      if (data.length === 0) {
        set.status = 404;
        return { message: "Note not found" };
      }

      set.status = 204;
      return { message: `${data[0].title} deleted` };
    },
    { params: noteIdParams }
  );
