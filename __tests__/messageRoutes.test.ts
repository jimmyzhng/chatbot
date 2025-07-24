import { Request } from "express";
import messageRoutes from '../routes/messageRoutes';
import express from 'express';
import request from 'supertest';
import pool from '../db';
import { Pool, QueryResult } from 'pg';
import { getUserById } from "../services/userService";

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

    it('Should return 400 if no message is provided', () => {

    })


})