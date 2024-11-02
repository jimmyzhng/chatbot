import pg from 'pg';
import { config } from 'dotenv';

const { Pool } = pg;
config();

// Configure the connection pool
const pool = new Pool({
    user: process.env.LOCAL_PSQL_USER,
    host: process.env.LOCAL_PSQL_HOST,    
    database: process.env.LOCAL_PSQL_DB,  
    password: process.env.LOCAL_PSQL_PASS,
    port: Number(process.env.LOCAL_PSQL_PORT),             
});


export default pool;
