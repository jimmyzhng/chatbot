import pool from "../db";

export const getUserById = async (userId: string) => {
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

export const updateUserMessageCount = async (userId: string, messageCount: number, lastMessageDate: string) => {

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