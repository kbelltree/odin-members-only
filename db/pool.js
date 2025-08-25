const { Pool } = require('pg');

module.exports = new Pool({
  connectionString: process.env.DEV_DATABASE_URL,
});
