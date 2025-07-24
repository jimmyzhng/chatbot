import {Pool} from 'pg';
import { config } from 'dotenv';


config();

// Local PSQL connection
// const pool = new Pool({
//     user: process.env.LOCAL_PSQL_USER,
//     host: process.env.LOCAL_PSQL_HOST,    
//     database: process.env.LOCAL_PSQL_DB,  
//     password: process.env.LOCAL_PSQL_PASS,
//     port: Number(process.env.LOCAL_PSQL_PORT),             
// });

// Supabase connection
const pool: Pool = new Pool({
    connectionString: process.env.SUPABASE_DIRECT_URL,
    ssl: { rejectUnauthorized: false },
    // add connection timeout and retry settings
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20, // max clients in pool
});

// Test connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
