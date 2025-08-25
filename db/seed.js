require('dotenv').config();
const { Client } = require('pg');

const SQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        username VARCHAR(15) NOT NULL UNIQUE, 
        first VARCHAR(30) NOT NULL, 
        last VARCHAR(30) NOT NULL, 
        password TEXT NOT NULL, 
        is_member BOOLEAN NOT NULL DEFAULT FALSE,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
    );
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR(160), 
        message VARCHAR(300) NOT NULL, 
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, 
        user_id INTEGER NOT NULL REFERENCES users(id)
    );
`;

async function seed() {
  console.log('seeding...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    await client.query(SQL);
  } catch (err) {
    console.error(err);
  }
  await client.end();
  console.log('seeding completed.');
}

seed();
