import { NextFunction, Request, Response } from "express";
import { rateLimit } from "../middleware/rateLimit";
import * as userService from '../services/userService';

describe('Rate Limiting Tests', () => {

    let mockUser: any;
    let req: Request;
    let res: any;
    let next: NextFunction;

    beforeEach(() => {
        mockUser = {
            id: '123',
            message_count: 3,
            last_message_date: new Date().toISOString().split('T')[0],
        }

        req = {
            body: {
                id: '123'
            }
        } as unknown as Request

        res = {} as Response;
        next = jest.fn() as NextFunction;

        // mock values for testing purposes
        jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
        jest.spyOn(userService, 'updateUserMessageCount').mockResolvedValue(undefined);
    })


    it('Should allow requests if message count is not at limit', async () => {
        await rateLimit(req, res, next)
        expect(next).toHaveBeenCalled()
        
    })  

    it('Should return "Rate limit exceeded" if message count is at limit', async () => {
        mockUser.message_count = 5;

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          } as any;

        await rateLimit(req, res, next);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({error: 'Rate limit exceeded.'});
        expect(next).not.toHaveBeenCalled();
    })
})
