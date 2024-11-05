import express, { Router } from "express";
import pool from "../db";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.body;

  try {
    pool.query(
      `
           SELECT * FROM messages
           WHERE id = $1 `,
      [id]
    );
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Database Error");
  }
});

export default router;
