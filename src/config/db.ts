import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DB_ENV = process.env.DB_ENV || 'local';

const localConfig: mysql.PoolOptions = {
  host: process.env.LOCAL_DB_HOST || 'localhost',
  port: Number(process.env.LOCAL_DB_PORT) || 3306,
  user: process.env.LOCAL_DB_USER || 'root',
  password: process.env.LOCAL_DB_PASSWORD,
  database: process.env.LOCAL_DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Aiven provides a CA certificate to verify their SSL — download it from:
// Aiven Console → your MySQL service → Connection info → Download CA cert → save as ca.pem in project root
const caCertPath = path.join(__dirname, '../../ca.pem');
const hasCert = fs.existsSync(caCertPath);

if (hasCert) {
  console.log('[DB] SSL: CA certificate found (ca.pem) — rejectUnauthorized: TRUE (full verification)');
} else {
  console.log('[DB] SSL: CA certificate not found — rejectUnauthorized: FALSE (encrypted but no cert verification)');
}

const sslOptions = hasCert
  ? { ca: fs.readFileSync(caCertPath), rejectUnauthorized: true }
  : { rejectUnauthorized: false };

const aivenConfig: mysql.PoolOptions = {
  host: process.env.AIVEN_DB_HOST,
  port: Number(process.env.AIVEN_DB_PORT),
  user: process.env.AIVEN_DB_USER,
  password: process.env.AIVEN_DB_PASSWORD,
  database: process.env.AIVEN_DB_NAME,
  ssl: sslOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const poolConfig = DB_ENV === 'aiven' ? aivenConfig : localConfig;

const pool = mysql.createPool(poolConfig);

export const testConnection = async (): Promise<void> => {
  const connection = await pool.getConnection();
  console.log(`[DB] Connected to ${DB_ENV.toUpperCase()} MySQL at ${poolConfig.host}:${poolConfig.port}`);
  connection.release();
};

export default pool;
