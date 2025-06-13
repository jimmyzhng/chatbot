import pool from "../db";
import { Request, Response, NextFunction } from 'express';

 const getUserById = async (userId: string) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users
            where id = $1
            `, [userId])         
            return result.rows[0]
    } catch (err) {
        console.error("Database query error:", err);
        throw new Error("Database Error");
    }
    
}

const updateUserMessageCount = async (userId: string, messageCount: number, lastMessageDate: string) => {

    try {
        await pool.query(`
            UPDATE users
            SET "message_count" = $2, "last_message_date" = $3
            WHERE id = $1
            `, [userId, messageCount, lastMessageDate])
        
    } catch (err) {
        console.error("Database update error:", err);
        throw new Error("Database Error");
    }

}

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const userId = req.body.id
    const user = await getUserById(userId)

    // console.log('user', user)

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const today = new Date().toISOString().split('T')[0];

      if (user['last_message_date'] !== today) {
        // console.log('Today & last message date', today, user['last_message_date'])

        user['message_count'] = 0;
        console.log('Message count reset.')
        user['last_message_date'] = today;
      }

      if (user['message_count'] >= 5) {
        return res.status(429).json({error: 'Rate limit exceeded.'})
      }

      user['message_count'] += 1

    //   console.log('Message Count after:', user['message_count'])

      await updateUserMessageCount(userId, user['message_count'], user['last_message_date'])
      next();

    } catch (err) {
        console.error("Error running rate limit function:", err);
        throw new Error("Rate Limit Error.");
    }
 
}