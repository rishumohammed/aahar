#!/bin/sh

echo "Waiting for database to be ready..."
# A simple wait loop using Node to ping the MariaDB server before running migrations.
node -e "
const mysql = require('mysql2/promise');
const timeout = 60000;
const start = Date.now();
async function wait() {
  while (Date.now() - start < timeout) {
    try {
      // Parse DATABASE_URL for simplicity or use individual vars
      const dbUrl = new URL(process.env.DATABASE_URL);
      const conn = await mysql.createConnection({
        host: dbUrl.hostname,
        port: dbUrl.port || 3306,
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.replace('/', '')
      });
      await conn.end();
      console.log('Database is ready!');
      process.exit(0);
    } catch (err) {
      console.log('Waiting for database (connection failed)...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('Database connection timed out');
  process.exit(1);
}
wait();
"

echo "Generating Prisma Client..."
npx prisma generate

echo "Running Database Migrations..."
# If Prisma migration files exist, this runs them. If none exist but schema changed, we fallback.
# In a pure production env, migrate deploy is safest. 
npx prisma migrate deploy

echo "Starting Backend Server..."
npm run start
