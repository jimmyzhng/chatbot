import express, { Express, Request, Response } from "express";
import cors from "cors";
import { Document, VectorStoreIndex, SimpleDirectoryReader, Settings, OpenAI } from "llamaindex";
import { config } from 'dotenv';

import userRoutes from './routes/userRoutes' 

config();

Settings.llm = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });

const app: Express = express();
const port = process.env.PORT || 3005;
app.use(cors());

// Middleware to use JSON body parsing
app.use(express.json());

app.use('/user', userRoutes)

// Load and index documents
async function initializeIndex() {

    const documents = await new SimpleDirectoryReader().loadData('./data')
    
    // splits text, creates embedding, then stores them in VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments(documents)
    return index.asQueryEngine()
}


app.post('/query', async (req: Request, res: Response): Promise<void> => {

    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
         res.status(400).json({ error: 'Query is required.' });
         return;
        }

        const queryEngine = await initializeIndex();
    
        const response = await queryEngine.query({ query: `Answer as a personal assistant who knows all about Jimmy Zhang. Be polite, personable, and answer as if you're helping someone learn about Jimmy. Query: "${query}` });
         res.send({ response: response.toString() });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });