import { Request } from "express";
import messageRoutes from '../routes/messageRoutes';
import express from 'express';
import request from 'supertest';
import pool from '../db';
import { Pool, QueryResult } from 'pg';
import { getUserById } from "../services/userService";

jest.mock('../middleware/rateLimit', () => ({
    rateLimit: jest.fn((req, res, next) => next())
}));

jest.mock('llamaindex', () => ({
    Document: jest.fn(),
    VectorStoreIndex: {
        fromDocuments: jest.fn().mockResolvedValue({
            asQueryEngine: jest.fn().mockResolvedValue({
                query: jest.fn().mockResolvedValue({
                    toString: () => 'Welcome to Jimmy\'s AI-powered chatbot! How can I assist you today?'
                })
            })
        })
    },
    SimpleDirectoryReader: jest.fn().mockImplementation(() => ({
        loadData: jest.fn().mockResolvedValue([])
    })),
    Settings: {
        llm: {}
    },
    OpenAI: jest.fn().mockImplementation(() => ({
    }))
}));

const poolQuery = pool as unknown as Pool

const app = express();
app.use(express.json());
app.use('/', messageRoutes);

describe('Message Routes', () => {
    afterEach(() => {
        jest.restoreAllMocks();
      });
      
    // get requests
    it('Should return 400 if no user ID is provided', async () => {
        const res = await request(app).get('/')
        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'User ID is required'})

    })

    it('Should retrieve messages for a given user', async () => {
        const messages = [{id: '123', message: 'hello', sender: 'user', user_id: '123' }]

        jest.spyOn(poolQuery, 'query' as any).mockResolvedValue({rows: messages})

        const res = await request(app).get('/').query({id: '123'})

        expect(res.status).toBe(200)
        expect(res.body).toEqual(messages);

    })

    // post requests
 
    it('Should return 400 if no message is provided', async () => {
        const res = await request(app).post('/').send({id: '123', message: '', sender: 'user'})
        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'Message (string) is required'})
    })

    it('Should return 400 if message is not a string', async () => {
        const res = await request(app).post('/').send({
            message: 123,
            sender: 'user',
            id: '123'
        })
        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'Message (string) is required'})
    })

    it('Should return 400 if no user id is provided', async () => {
        const res = await request(app).post('/').send({message: '12323', sender: 'user'});
        expect(res.status).toBe(400);
        expect(res.body).toEqual({error: "User ID is required"})
    })

    it('Should process a message and return a chat response', async () => {
        // post request with message, sender, id
        const message = {id: 123, message: 'hello', sender: 'user'}

        // mock db operation to save message to db
        const mockQuery = jest.spyOn(poolQuery, 'query' as any)
        mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });

        // call GPT API, saves response to db and returns ai response 
        const res = await request(app).post('/').send(message);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('chatResponse');
        expect(typeof res.body.chatResponse).toBe('string');

        expect(mockQuery).toHaveBeenCalledTimes(2);

        expect(mockQuery).toHaveBeenNthCalledWith(1,
            expect.stringContaining('INSERT INTO messages'),
            ['hello', 'user', 123]
        )
        expect(mockQuery).toHaveBeenNthCalledWith(2,
            expect.stringContaining('INSERT INTO messages'),
            [expect.any(String), 'assistant', 123]
        )

    })




})