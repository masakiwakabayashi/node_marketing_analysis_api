import express, { Request, Response } from "express";
import { Client } from "pg";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 4000;

const prisma = new PrismaClient();

// PostgreSQLクライアントの設定
const dbClient = new Client({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "postgres",
});

// DB接続テスト
dbClient
  .connect()
  .then(() => {
    console.log("PostgreSQL connected");
  })
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Prisma経由でUser一覧を取得
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("=== /users ERROR ===");
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 特定ユーザーのメモ一覧取得
app.get("/users/:userId/memos", async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  try {
    const memos = await prisma.memo.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
    res.json(memos);
  } catch (error) {
    console.error("=== /users/:userId/memos ERROR ===");
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    res.status(500).json({ error: "Failed to fetch memos" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
