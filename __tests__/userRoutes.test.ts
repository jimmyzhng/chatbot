import express from 'express';
import request from 'supertest';
import pool from '../db';
import userRoutes from '../routes/userRoutes';
import pg from 'pg';
const { Pool } = pg;

const poolQuery = pool as any;

const app = express();
app.use(express.json());
app.use('/', userRoutes)

describe('User Routes', () => {
    afterEach(() => {
        jest.restoreAllMocks();
      });
      
    // GET request

    it('should return 400 if no user ID is provided', async () => {
        const res = await request(app).get('/').query({})

        expect(res.status).toBe(400);
        expect(res.body).toEqual({error: 'User ID is required'})
    })


    it('should retrieve user information for a given user ID', async () => {
        const messages = [{id: '123', message: 'hello', sender: 'user', }]
        // Mock the pool query
        jest.spyOn(poolQuery, 'query' as any).mockResolvedValue({rows: messages, rowCount: 1})

        const res = await request(app).get('/').query({id: '123'})

        expect(res.status).toBe(200);
        expect(res.body).toEqual(messages);
    })
    // POST request


})