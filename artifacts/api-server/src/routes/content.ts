import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { missionsTable, lessonsTable, simulationsTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/missions", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(missionsTable)
      .where(eq(missionsTable.isActive, true))
      .orderBy(asc(missionsTable.orderIndex));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});

router.get("/lessons", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.isActive, true))
      .orderBy(asc(lessonsTable.orderIndex));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

router.get("/simulations", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(simulationsTable)
      .where(eq(simulationsTable.isActive, true))
      .orderBy(asc(simulationsTable.orderIndex));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch simulations" });
  }
});

export default router;
