import express, { Router } from "express";
import { Document, VectorStoreIndex, SimpleDirectoryReader, Settings, OpenAI } from "llamaindex";
import { config } from 'dotenv';
import pool from "../db";

const router: Router = express.Router();

Settings.llm = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });

  // Load and index documents
async function initializeIndex() {

    const documents = await new SimpleDirectoryReader().loadData('../data')
    
    // splits text, creates embedding, then stores them in VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments(documents)
    return index.asQueryEngine()
}


router.get("/", async (req, res) => {
  const { id } = req.body;

  try {
    const result = await pool.query(
      `
           SELECT * FROM messages
           WHERE id = $1 `,
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Database Error");
  }
});

// Update DB + Query GPT
router.post("/", async (req, res) => {  
    try {
       const { message, sender, user_id } = req.body;
     
       if (!message || typeof message !== 'string') {
         res.status(400).json({ error: 'Message is required.' });
         return;
        }
       const dbResult = await pool.query(
           `
           INSERT INTO messages
           (message, sender, user_id)
           VALUES ($1 $2 $3)
           
           `,
           [message, sender, user_id]
        );
        
    const queryEngine = await initializeIndex();
    const chatResponse = await queryEngine.query({ query: `
        Answer as a personal assistant who knows all about Jimmy Zhang. Be polite, personable, 
        and answer as if you're helping someone learn about Jimmy. Answer in a conversation style, 
        and only answer questions that are asked. Query: "${message}` });
    res.send({ chatResponse: chatResponse.toString() });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server Error");
  }
});

export default router;
