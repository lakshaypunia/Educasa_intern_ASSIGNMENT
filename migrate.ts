import pool from './src/config/db';

const createSchoolsTable = `
  CREATE TABLE IF NOT EXISTS schools (
    id         INT           AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255)  NOT NULL,
    address    VARCHAR(255)  NOT NULL,
    latitude   FLOAT         NOT NULL,
    longitude  FLOAT         NOT NULL,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
  )
`;

async function migrate() {
  console.log('[MIGRATE] Running migration...');
  await pool.execute(createSchoolsTable);
  console.log('[MIGRATE] schools table created (or already exists)');
  await pool.end();
}

migrate().catch((err) => {
  console.error('[MIGRATE] Failed:', err.message);
  process.exit(1);
});
