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
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
