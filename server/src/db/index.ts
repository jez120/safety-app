import { Pool } from 'pg';
// dotenv should be configured in the main server file (server.ts)
// import dotenv from 'dotenv';
// dotenv.config({ path: '../../.env' }); // REMOVE THIS LINE

const pool = new Pool({ // Reads process.env variables loaded by server.ts
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process if DB connection fails critically
});

export default pool;
