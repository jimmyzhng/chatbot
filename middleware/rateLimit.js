import pool from "../db";

 const getUserById = async (userId) => {
    try {
        const result =await pool.query(`
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
            SET messageCount = $1, LastMessageDate = $2
            WHERE id = $3
            `, [userId, messageCount, lastMessageDate])
        
    } catch (err) {
        console.error("Database update error:", err);
        throw new Error("Database Error");
    }

}

export const rateLimit = async (req, res, next) => {
    try {
    const userId = req.user.id;
    const user = await getUserById(userId)

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
        console.error("Database update error:", err);
        throw new Error("Database Error");
    }
 
}