import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config } from 'dotenv';
import pool from './db';

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

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database');
    client.release();
    return true;
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    return false;
  }
}

testDatabaseConnection().then(connected => {
  if (connected) {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } else {
    console.error('Failed to start server due to database connection issues');
    process.exit(1);
  }
});
