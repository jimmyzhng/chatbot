import pool from "../db";

 const getUserById = async (userId) => {
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

const updateUserMessageCount = async (userId, messageCount, lastMessageDate) => {
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

export const rateLimit = async (req, res, next) => {
    try {
    const userId = req.body.id
    const user = await getUserById(userId)

    // console.log('user', user)

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const today = new Date().toISOString().split('T')[0];

      if (user.lastMessageDate !== today) {
        user.messageCount = 0;
        user.lastMessageDate = today;
      }

      if (user.messageCount >= 5) {
        return res.status(429).json({error: 'Rate limit exceeded.'})
      }

      user.messageCount += 1

      await updateUserMessageCount(userId, user.messageCount, user.lastMessageDate)
      next();

    } catch (err) {
        console.error("Error running rate limit function:", err);
        throw new Error("Rate Limit Error.");
    }
 
}