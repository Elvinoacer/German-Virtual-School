const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_8m2ilChFGBDW@ep-broad-bush-a47y7ssf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });

(async () => {
  try {
    console.log('Testing connection...');
    const res = await pool.query('SELECT NOW()');
    console.log('Connected! Server time:', res.rows[0].now);
    await pool.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
})();
