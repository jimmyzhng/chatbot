import express, {Router} from "express";
import pool from "../db";

const router: Router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await pool.query(`
            INSERT INTO users 
            DEFAULT VALUES;
            `);

    // return uuid
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Database Error");
  }
});

router.get("/", async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query(
      `
            SELECT * FROM users
            WHERE id = $1
            `,
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Database Error");
  }
});

export default router;