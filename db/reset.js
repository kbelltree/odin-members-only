// Reset the database to redo seeding
require('dotenv').config();
const { Client } = require('pg');

const SQL = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS user_info CASCADE;
    DROP TABLE IF EXISTS messages CASCADE;
`;

async function dropTables() {
  console.log('drop table processing...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    await client.query(SQL);
    console.log('drop table completed.');
  } catch (err) {
    console.error(err);
  }
  await client.end();
  console.log('drop tables completed.');
}

dropTables();
