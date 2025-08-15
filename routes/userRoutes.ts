import express, {Request, Response, Router} from "express";
import pool from "../db";

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            INSERT INTO users 
            DEFAULT VALUES
            RETURNING id;
            `);

    // return uuid in an object ('id': uuid)
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Database Error");
  }
});

router.get("/", async (req: Request<{}, {}, {}, {id: string}>, res: Response) => {
  const { id } = req.query;

  if (!id) {
    console.error("No user ID provided in query");
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `
            SELECT * FROM users
            WHERE id = $1
            `,
      [id]
    );

    if (result.rows.length === 0) {
      console.error("No user found with ID:", id);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({error: "Database error"})
  }
});

export default router;