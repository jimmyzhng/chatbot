import { Request, Response, NextFunction } from 'express';
import { getUserById, updateUserMessageCount } from '../services/userService';

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