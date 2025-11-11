import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function postgresConnect() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connection established successfully.');
    return client;
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error);
    throw error;
  }
}

export { pool };