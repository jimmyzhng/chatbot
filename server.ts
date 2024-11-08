import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config } from 'dotenv';

import userRoutes from './routes/userRoutes' 
import messageRoutes from './routes/messageRoutes'

config();

const app: Express = express();
const port = process.env.PORT || 3005;
app.use(cors());

// Middleware to use JSON body parsing
app.use(express.json());

app.use('/user', userRoutes)
app.use('/message', messageRoutes)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });