import express, { Router, Request, Response } from "express";
import { Document, VectorStoreIndex, SimpleDirectoryReader, Settings, OpenAI } from "llamaindex";
import pool from "../db";
import { rateLimit } from '../middleware/rateLimit.js'
import { MessageQuery } from "../types/messages.types";

const router: Router = express.Router();

Settings.llm = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });

  // Load and index documents
async function initializeIndex() {

    const documents = await new SimpleDirectoryReader().loadData('./data')
    
    // splits text, creates embedding, then stores them in VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments(documents)
    return index.asQueryEngine()
}


router.get("/", async (req: Request<{}, {}, {}, MessageQuery>, res: Response) => {
  try {
    const { id } = req.query

    if (!id) {
      console.error("No user ID provided in query");
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log("Attempting to fetch messages for user:", id);
    const result = await pool.query(
      `
           SELECT * FROM messages
           WHERE user_id = $1 `,
      [id]
    );

    console.log("Query successful, found", result.rows.length, "messages");
    res.status(200).json(result.rows);
    return;
  } catch (err: any) {
    console.error("Database query error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail
    });
    res.status(500).json({ 
      error: "Database Error",
      details: err.message 
    });
  }
  return;
});

// Update DB + Query GPT
router.post("/", rateLimit, async (req: Request, res: Response) => {  
    try {
       const { message, sender, id } = req.body;
     
       if (!message || typeof message !== 'string') {
         res.status(400).json({ error: 'Message is required.' });
         return;
        }
       const dbResult = await pool.query(
           `
           INSERT INTO messages
           (message, sender, user_id)
           VALUES ($1, $2, $3)
           
           `,
           [message, sender, id]
        );
        
    const queryEngine = await initializeIndex();
    const chatResponse = await queryEngine.query({ query: `
        Answer as a personal assistant who knows all about Jimmy. Be polite, personable, 
        and answer as if you're helping someone learn about Jimmy. Answer in a conversation style, keeping responses short and conversation-like unless asked for detail. Don't start the response with exclamations.
        Query: "${message}` });

        await pool.query(
          `
          INSERT INTO messages
          (message, sender, user_id)
          VALUES ($1, $2, $3)
          `,
          [chatResponse.toString(), 'assistant', id]
      );

    
    res.send({ chatResponse: chatResponse.toString() });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server Error");
  }
});

// delete method
router.delete("/:id", async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    const { id } = req.params

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid ID.' });
      return;
    }

    const dbResult = await pool.query(`
      DELETE FROM messages
      WHERE user_id = $1
      `, [id])
      
      if (dbResult) {
        res.status(200).json("Message deleted successfully");
      }

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json("Server Error");
  }

})

export default router;
