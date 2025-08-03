import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@shared/schema";

// Check for MySQL database URL, fallback to environment variable
const databaseUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("MYSQL_DATABASE_URL or DATABASE_URL must be set.");
}

// Create MySQL connection pool  
const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
});

// Create Drizzle client using the schema with mode
export const db = drizzle(pool, { schema, mode: "default" });
