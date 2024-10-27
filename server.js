import "dotenv/config";
import express from "express";
import cors from "cors";
import { Document, VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// Middleware to use JSON body parsing
app.use(express.json());